import * as vscode from 'vscode';
import * as path from 'path';
import {
  Session,
  ProjectMeta,
  SessionSchema,
  ProjectMetaSchema,
  generateId,
  nowISO,
  createDefaultPrivacySettings,
} from '@proveit/shared';
import { log, logError } from '../utils/logger';

const PROVEIT_DIR = '.proveit';
const SESSIONS_DIR = 'sessions';
const PROJECT_META_FILE = 'project.json';

export class LocalStorageManager {
  private projectRoot: string;
  private proveitDir: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.proveitDir = path.join(projectRoot, PROVEIT_DIR);
  }

  async initialize(): Promise<void> {
    const sessionsDir = vscode.Uri.file(path.join(this.proveitDir, SESSIONS_DIR));
    try {
      await vscode.workspace.fs.createDirectory(sessionsDir);
    } catch {
      // directory may already exist
    }

    const metaUri = vscode.Uri.file(path.join(this.proveitDir, PROJECT_META_FILE));
    try {
      await vscode.workspace.fs.stat(metaUri);
    } catch {
      const meta: ProjectMeta = {
        id: generateId('proj'),
        name: path.basename(this.projectRoot),
        rootPath: this.projectRoot,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        privacy: createDefaultPrivacySettings(),
        totalSessions: 0,
      };
      await this.writeJson(metaUri, meta);
      log(`Initialized ProveIt project: ${meta.name}`);
    }
  }

  async getProjectMeta(): Promise<ProjectMeta> {
    const metaUri = vscode.Uri.file(path.join(this.proveitDir, PROJECT_META_FILE));
    const data = await this.readJson(metaUri);
    return ProjectMetaSchema.parse(data);
  }

  async updateProjectMeta(updates: Partial<ProjectMeta>): Promise<void> {
    const meta = await this.getProjectMeta();
    const updated = { ...meta, ...updates, updatedAt: nowISO() };
    const metaUri = vscode.Uri.file(path.join(this.proveitDir, PROJECT_META_FILE));
    await this.writeJson(metaUri, updated);
  }

  async saveSession(session: Session): Promise<void> {
    const validated = SessionSchema.parse(session);
    const sessionUri = vscode.Uri.file(
      path.join(this.proveitDir, SESSIONS_DIR, `${session.id}.json`),
    );
    await this.writeJson(sessionUri, validated);
    log(`Saved session: ${session.id}`);
  }

  async loadSession(sessionId: string): Promise<Session> {
    const sessionUri = vscode.Uri.file(
      path.join(this.proveitDir, SESSIONS_DIR, `${sessionId}.json`),
    );
    const data = await this.readJson(sessionUri);
    return SessionSchema.parse(data);
  }

  async listSessions(): Promise<string[]> {
    const sessionsUri = vscode.Uri.file(path.join(this.proveitDir, SESSIONS_DIR));
    try {
      const entries = await vscode.workspace.fs.readDirectory(sessionsUri);
      return entries
        .filter(([name, type]) => type === vscode.FileType.File && name.endsWith('.json'))
        .map(([name]) => name.replace('.json', ''))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionUri = vscode.Uri.file(
      path.join(this.proveitDir, SESSIONS_DIR, `${sessionId}.json`),
    );
    try {
      await vscode.workspace.fs.delete(sessionUri);
      log(`Deleted session: ${sessionId}`);
    } catch (error) {
      logError(`Failed to delete session: ${sessionId}`, error);
    }
  }

  private async writeJson(uri: vscode.Uri, data: unknown): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
  }

  private async readJson(uri: vscode.Uri): Promise<unknown> {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return JSON.parse(Buffer.from(bytes).toString('utf-8'));
  }
}
