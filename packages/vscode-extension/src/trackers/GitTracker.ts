import * as vscode from 'vscode';
import { EventType } from '@proveit/shared';
import { SessionManager } from '../session/SessionManager';
import { log, logError } from '../utils/logger';

interface GitExtensionAPI {
  repositories: GitRepository[];
}

interface GitRepository {
  state: {
    HEAD?: { name?: string; commit?: string };
  };
  log(options?: { maxEntries?: number }): Promise<GitCommit[]>;
}

interface GitCommit {
  hash: string;
  message: string;
}

export class GitTracker implements vscode.Disposable {
  private pollInterval: ReturnType<typeof setInterval> | undefined;
  private lastCommitHash: string | undefined;
  private lastBranch: string | undefined;
  private gitApi: GitExtensionAPI | undefined;

  constructor(private sessionManager: SessionManager) {}

  async start(): Promise<void> {
    try {
      const gitExtension = vscode.extensions.getExtension('vscode.git');
      if (!gitExtension) {
        log('Git extension not found');
        return;
      }

      const git = gitExtension.isActive
        ? gitExtension.exports
        : await gitExtension.activate();
      this.gitApi = git.getAPI(1);

      if (this.gitApi && this.gitApi.repositories.length > 0) {
        const repo = this.gitApi.repositories[0];
        this.lastBranch = repo.state.HEAD?.name;
        this.lastCommitHash = repo.state.HEAD?.commit;
      }

      // Poll every 30 seconds
      this.pollInterval = setInterval(() => this.poll(), 30_000);
      log('GitTracker started');
    } catch (error) {
      logError('Failed to initialize GitTracker', error);
    }
  }

  private async poll(): Promise<void> {
    if (!this.gitApi || this.gitApi.repositories.length === 0) return;

    const repo = this.gitApi.repositories[0];
    const currentBranch = repo.state.HEAD?.name;
    const currentCommit = repo.state.HEAD?.commit;

    // Detect branch switch
    if (currentBranch && this.lastBranch && currentBranch !== this.lastBranch) {
      this.sessionManager.addEvent(EventType.GIT_BRANCH_SWITCH, {
        fromBranch: this.lastBranch,
        toBranch: currentBranch,
      });
      log(`Branch switch: ${this.lastBranch} -> ${currentBranch}`);
    }
    this.lastBranch = currentBranch;

    // Detect new commit
    if (currentCommit && currentCommit !== this.lastCommitHash) {
      try {
        const commits = await repo.log({ maxEntries: 1 });
        if (commits.length > 0) {
          const commit = commits[0];
          this.sessionManager.addEvent(EventType.GIT_COMMIT, {
            hash: commit.hash,
            message: commit.message,
            filesChanged: 0,
            insertions: 0,
            deletions: 0,
            branch: currentBranch ?? 'unknown',
          });
          log(`New commit detected: ${commit.hash.substring(0, 7)}`);
        }
      } catch (error) {
        logError('Failed to read git log', error);
      }
      this.lastCommitHash = currentCommit;
    }
  }

  dispose(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }
}
