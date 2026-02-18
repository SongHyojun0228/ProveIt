import * as vscode from 'vscode';
import { log } from '../utils/logger';

const CONSENT_KEY = 'proveit.consentGiven';

export class ConsentManager {
  constructor(private context: vscode.ExtensionContext) {}

  hasConsented(): boolean {
    return this.context.globalState.get<boolean>(CONSENT_KEY, false);
  }

  async requestConsent(): Promise<boolean> {
    if (this.hasConsented()) {
      return true;
    }

    const result = await vscode.window.showInformationMessage(
      'ProveIt tracks your coding process to build verifiable portfolios. ' +
      'All data is stored locally on your machine. ' +
      'You can control what is tracked in settings.',
      { modal: true },
      'I Agree',
      'Learn More',
    );

    if (result === 'I Agree') {
      await this.context.globalState.update(CONSENT_KEY, true);
      log('User consented to tracking');
      return true;
    }

    if (result === 'Learn More') {
      vscode.env.openExternal(vscode.Uri.parse('https://proveit.dev/privacy'));
      return this.requestConsent();
    }

    log('User declined tracking consent');
    return false;
  }

  async revokeConsent(): Promise<void> {
    await this.context.globalState.update(CONSENT_KEY, false);
    log('User revoked tracking consent');
  }
}
