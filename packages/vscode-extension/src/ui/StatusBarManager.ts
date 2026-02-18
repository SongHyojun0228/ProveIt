import * as vscode from 'vscode';
import { SessionState } from '@proveit/shared';

export class StatusBarManager implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBarItem.command = 'proveit.showDashboard';
    this.update(null);
    this.statusBarItem.show();
  }

  update(state: SessionState | null): void {
    switch (state) {
      case SessionState.ACTIVE:
        this.statusBarItem.text = '$(record) ProveIt: Recording';
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.tooltip = 'ProveIt is recording your session. Click to view dashboard.';
        break;
      case SessionState.PAUSED:
        this.statusBarItem.text = '$(debug-pause) ProveIt: Paused';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          'statusBarItem.warningBackground',
        );
        this.statusBarItem.tooltip = 'ProveIt session is paused. Resume activity to continue.';
        break;
      default:
        this.statusBarItem.text = '$(circle-outline) ProveIt: Inactive';
        this.statusBarItem.backgroundColor = undefined;
        this.statusBarItem.tooltip = 'ProveIt is not recording. Click to start a session.';
        break;
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
