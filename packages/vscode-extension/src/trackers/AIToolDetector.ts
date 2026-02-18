import * as vscode from 'vscode';
import * as fs from 'fs';
import { exec } from 'child_process';
import { EventType, type AIToolName, type AIToolDetectionMethod } from '@proveit/shared';
import { SessionManager } from '../session/SessionManager';
import { getConfig } from '../utils/config';
import { log } from '../utils/logger';

interface ProcessInfo {
  toolName: AIToolName;
  processName: string;
  pid: number;
}

interface FileChangeRecord {
  filePath: string;
  languageId: string;
  linesAdded: number;
  linesDeleted: number;
  changeSize: number;
  timestamp: number;
  hadRecentKeystroke: boolean;
}

interface ActiveToolSession {
  toolName: AIToolName;
  startTime: number;
  filesEdited: Set<string>;
  totalLinesChanged: number;
}

// Map file content snapshots for diff calculation on filesystem changes
interface FileSnapshot {
  lineCount: number;
  size: number;
}

const PROCESS_PATTERNS: { pattern: RegExp; toolName: AIToolName }[] = [
  { pattern: /claude/i, toolName: 'claude-code' },
  { pattern: /aider/i, toolName: 'aider' },
  { pattern: /cursor/i, toolName: 'cursor-agent' },
  { pattern: /copilot/i, toolName: 'copilot-cli' },
];

const IGNORED_PATH_PATTERNS = [
  /node_modules/,
  /\/dist\//,
  /\.next\//,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.git\//,
  /\.proveit\//,
];

const EXTERNAL_CHANGE_CHAR_THRESHOLD = 50;
const EXTERNAL_CHANGE_TIME_MS = 2000;
const BURST_WINDOW_MS = 10_000;
const BURST_FILE_THRESHOLD = 3;
const BURST_LINE_THRESHOLD = 50;
const GIT_SUPPRESSION_MS = 15_000;
const PROCESS_POLL_MS = 15_000;
const CONFIDENCE_THRESHOLD = 0.4;

export class AIToolDetector implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private processCheckInterval: ReturnType<typeof setInterval> | undefined;

  // Strategy 1: External change detection
  private lastKeystrokeTime = new Map<string, number>();

  // Strategy 2: Process detection
  private activeProcesses = new Map<string, ProcessInfo>();

  // Strategy 3: Velocity analysis
  private recentChanges: FileChangeRecord[] = [];
  private lastGitSwitchTime = 0;

  // Tool sessions
  private activeToolSessions = new Map<string, ActiveToolSession>();

  // FileSystemWatcher for external changes
  private fileSnapshots = new Map<string, FileSnapshot>();
  // Track files recently changed by the editor to avoid double-counting
  private recentEditorChanges = new Set<string>();

  constructor(private sessionManager: SessionManager) {}

  start(): void {
    const config = getConfig();
    if (!config.aiToolDetection) return;

    // Strategy 1a: Listen for editor keystrokes (typing) to track user input
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.uri.scheme !== 'file') return;
        if (e.contentChanges.length === 0) return;

        const filePath = vscode.workspace.asRelativePath(e.document.uri);

        // Track that this file was recently changed through the editor
        this.recentEditorChanges.add(filePath);
        setTimeout(() => this.recentEditorChanges.delete(filePath), 1000);

        // Small single-char changes are likely user typing
        const totalChars = e.contentChanges.reduce((sum, c) => sum + c.text.length, 0);
        if (totalChars <= 2) {
          this.lastKeystrokeTime.set(filePath, Date.now());
        }

        this.onDocumentChange(e);
      }),
    );

    // Track editor saves and file creates to avoid false positives from FileSystemWatcher
    this.disposables.push(
      vscode.workspace.onDidSaveTextDocument((doc) => {
        if (doc.uri.scheme !== 'file') return;
        const filePath = vscode.workspace.asRelativePath(doc.uri);
        this.recentEditorChanges.add(filePath);
        setTimeout(() => this.recentEditorChanges.delete(filePath), 2000);
      }),
      vscode.workspace.onDidCreateFiles((e) => {
        for (const uri of e.files) {
          const filePath = vscode.workspace.asRelativePath(uri);
          this.recentEditorChanges.add(filePath);
          setTimeout(() => this.recentEditorChanges.delete(filePath), 2000);
        }
      }),
    );

    // Strategy 1b: FileSystemWatcher for external file changes (CLI tools)
    const watcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);

    watcher.onDidCreate((uri) => this.onFileSystemChange(uri, 'create'));
    watcher.onDidChange((uri) => this.onFileSystemChange(uri, 'change'));

    this.disposables.push(watcher);

    // Start process polling
    this.processCheckInterval = setInterval(() => this.checkProcesses(), PROCESS_POLL_MS);
    // Run initial check
    this.checkProcesses();

    log('AIToolDetector started (with FileSystemWatcher)');
  }

  /** Called by GitTracker or internally when branch switch is detected */
  notifyGitSwitch(): void {
    this.lastGitSwitchTime = Date.now();
  }

  private onFileSystemChange(uri: vscode.Uri, type: 'create' | 'change'): void {
    if (uri.scheme !== 'file') return;
    if (this.shouldIgnorePath(uri)) return;

    const now = Date.now();
    if (now - this.lastGitSwitchTime < GIT_SUPPRESSION_MS) return;

    const filePath = vscode.workspace.asRelativePath(uri);

    // If this file was recently changed through the editor, skip (avoid double-counting)
    if (this.recentEditorChanges.has(filePath)) return;

    // This is an external filesystem change — not from the editor
    // Read file to calculate line count
    try {
      const stat = fs.statSync(uri.fsPath);
      if (stat.isDirectory()) return;
      // Skip large files (> 1MB)
      if (stat.size > 1_000_000) return;

      const content = fs.readFileSync(uri.fsPath, 'utf-8');
      const newLineCount = content.split('\n').length;
      const newSize = content.length;

      const prev = this.fileSnapshots.get(filePath);
      let linesAdded = 0;
      let linesDeleted = 0;
      let changeSize = 0;

      if (type === 'create' || !prev) {
        linesAdded = newLineCount;
        linesDeleted = 0;
        changeSize = newSize;
      } else {
        linesAdded = Math.max(0, newLineCount - prev.lineCount);
        linesDeleted = Math.max(0, prev.lineCount - newLineCount);
        changeSize = Math.abs(newSize - prev.size);
      }

      // Update snapshot
      this.fileSnapshots.set(filePath, { lineCount: newLineCount, size: newSize });

      // Skip trivial changes
      if (changeSize < 10) return;

      const languageId = this.getLanguageId(filePath);

      const record: FileChangeRecord = {
        filePath,
        languageId,
        linesAdded,
        linesDeleted,
        changeSize,
        timestamp: now,
        hadRecentKeystroke: false, // Always false for filesystem events
      };

      this.recentChanges.push(record);
      this.recentChanges = this.recentChanges.filter((r) => now - r.timestamp < 30_000);

      this.evaluateChange(record);

      log(`External file ${type}: ${filePath} (+${linesAdded}/-${linesDeleted}, ${changeSize} chars)`);
    } catch {
      // File may have been deleted or unreadable, ignore
    }
  }

  private onDocumentChange(e: vscode.TextDocumentChangeEvent): void {
    if (this.shouldIgnorePath(e.document.uri)) return;

    const now = Date.now();
    if (now - this.lastGitSwitchTime < GIT_SUPPRESSION_MS) return;

    const filePath = vscode.workspace.asRelativePath(e.document.uri);
    const languageId = e.document.languageId;

    let linesAdded = 0;
    let linesDeleted = 0;
    let changeSize = 0;

    for (const change of e.contentChanges) {
      linesAdded += change.text.split('\n').length - 1;
      linesDeleted += change.range.end.line - change.range.start.line;
      changeSize += Math.abs(change.text.length - (change.rangeLength ?? 0));
    }

    const lastKeystroke = this.lastKeystrokeTime.get(filePath) ?? 0;
    const hadRecentKeystroke = now - lastKeystroke < EXTERNAL_CHANGE_TIME_MS;

    const record: FileChangeRecord = {
      filePath,
      languageId,
      linesAdded,
      linesDeleted,
      changeSize,
      timestamp: now,
      hadRecentKeystroke,
    };

    this.recentChanges.push(record);
    this.recentChanges = this.recentChanges.filter((r) => now - r.timestamp < 30_000);

    this.evaluateChange(record);
  }

  private evaluateChange(record: FileChangeRecord): void {
    let confidence = 0;
    const methods: AIToolDetectionMethod[] = [];

    // Strategy 1: External change (no recent keystroke + large change)
    if (!record.hadRecentKeystroke && record.changeSize >= EXTERNAL_CHANGE_CHAR_THRESHOLD) {
      confidence += 0.3;
      methods.push('external_change');
    }

    // Strategy 2: Process detection
    // When user is actively typing (hadRecentKeystroke), process detection alone
    // should NOT be sufficient — the AI tool may just be running in the background.
    const detectedTool = this.getActiveToolName();
    if (detectedTool) {
      confidence += record.hadRecentKeystroke ? 0.1 : 0.5;
      methods.push('process');
    }

    // Strategy 3: Burst velocity
    if (this.detectBurst()) {
      confidence += 0.2;
      methods.push('velocity');
    }

    // Cap confidence at 0.5 if no process detected
    if (!detectedTool && confidence > 0.5) {
      confidence = 0.5;
    }

    // Clamp
    confidence = Math.min(1.0, confidence);

    if (confidence >= CONFIDENCE_THRESHOLD) {
      const toolName = detectedTool ?? 'unknown';
      const method: AIToolDetectionMethod = methods.length > 1 ? 'combined' : methods[0] ?? 'external_change';

      this.sessionManager.addEvent(EventType.AI_TOOL_EDIT, {
        toolName,
        filePath: record.filePath,
        languageId: record.languageId,
        linesAdded: record.linesAdded,
        linesDeleted: record.linesDeleted,
        changeSize: record.changeSize,
        detectionMethod: method,
        confidence,
      });

      // Track tool session
      this.trackToolSession(toolName, record);
    }
  }

  private detectBurst(): boolean {
    const now = Date.now();
    const windowChanges = this.recentChanges.filter((r) => now - r.timestamp < BURST_WINDOW_MS);

    const uniqueFiles = new Set(windowChanges.map((r) => r.filePath));
    const totalLines = windowChanges.reduce((sum, r) => sum + r.linesAdded + r.linesDeleted, 0);

    return uniqueFiles.size >= BURST_FILE_THRESHOLD && totalLines >= BURST_LINE_THRESHOLD;
  }

  private getActiveToolName(): AIToolName | null {
    if (this.activeProcesses.size === 0) return null;
    const first = this.activeProcesses.values().next().value;
    return first?.toolName ?? null;
  }

  private checkProcesses(): void {
    const platform = process.platform;
    const cmd = platform === 'win32' ? 'tasklist /FO CSV /NH' : 'ps aux';

    exec(cmd, { timeout: 5000 }, (error, stdout) => {
      if (error) return;

      const previousProcesses = new Map(this.activeProcesses);
      this.activeProcesses.clear();

      const lines = stdout.split('\n');
      for (const line of lines) {
        for (const { pattern, toolName } of PROCESS_PATTERNS) {
          if (pattern.test(line)) {
            const pid = this.extractPid(line, platform);
            const processName = line.trim().split(/\s+/)[platform === 'win32' ? 0 : 10] ?? 'unknown';

            // Don't detect ourselves (this VS Code instance)
            if (toolName === 'cursor-agent' && line.includes('Code Helper')) continue;

            this.activeProcesses.set(toolName, { toolName, processName, pid });
          }
        }
      }

      // Emit AI_TOOL_DETECTED for newly appearing processes
      for (const [key, info] of this.activeProcesses) {
        if (!previousProcesses.has(key)) {
          this.sessionManager.addEvent(EventType.AI_TOOL_DETECTED, {
            toolName: info.toolName,
            processName: info.processName,
            pid: info.pid,
          });
          log(`AI tool process detected: ${info.toolName} (PID ${info.pid})`);
        }
      }

      // Emit AI_TOOL_SESSION_END for processes that disappeared
      for (const [key, info] of previousProcesses) {
        if (!this.activeProcesses.has(key)) {
          const session = this.activeToolSessions.get(key);
          if (session) {
            this.sessionManager.addEvent(EventType.AI_TOOL_SESSION_END, {
              toolName: info.toolName,
              durationMs: Date.now() - session.startTime,
              filesEdited: session.filesEdited.size,
              totalLinesChanged: session.totalLinesChanged,
            });
            this.activeToolSessions.delete(key);
            log(`AI tool session ended: ${info.toolName}`);
          }
        }
      }
    });
  }

  private extractPid(line: string, platform: string): number {
    if (platform === 'win32') {
      const match = line.match(/"(\d+)"/);
      return match ? parseInt(match[1], 10) : 0;
    }
    const parts = line.trim().split(/\s+/);
    return parts.length > 1 ? parseInt(parts[1], 10) : 0;
  }

  private trackToolSession(toolName: AIToolName, record: FileChangeRecord): void {
    let session = this.activeToolSessions.get(toolName);
    if (!session) {
      session = {
        toolName,
        startTime: Date.now(),
        filesEdited: new Set(),
        totalLinesChanged: 0,
      };
      this.activeToolSessions.set(toolName, session);
    }
    session.filesEdited.add(record.filePath);
    session.totalLinesChanged += record.linesAdded + record.linesDeleted;
  }

  private shouldIgnorePath(uri: vscode.Uri): boolean {
    const path = uri.fsPath;
    return IGNORED_PATH_PATTERNS.some((p) => p.test(path));
  }

  private getLanguageId(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      ts: 'typescript', tsx: 'typescriptreact',
      js: 'javascript', jsx: 'javascriptreact',
      py: 'python', rs: 'rust', go: 'go',
      java: 'java', kt: 'kotlin', swift: 'swift',
      css: 'css', scss: 'scss', html: 'html',
      json: 'json', yaml: 'yaml', yml: 'yaml',
      md: 'markdown', sql: 'sql', sh: 'shellscript',
      txt: 'plaintext',
    };
    return map[ext] ?? ext;
  }

  dispose(): void {
    if (this.processCheckInterval) {
      clearInterval(this.processCheckInterval);
      this.processCheckInterval = undefined;
    }
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    this.lastKeystrokeTime.clear();
    this.activeProcesses.clear();
    this.recentChanges = [];
    this.activeToolSessions.clear();
    this.fileSnapshots.clear();
    this.recentEditorChanges.clear();
  }
}
