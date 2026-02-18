import * as vscode from 'vscode';
import * as path from 'path';
import {
  HashEntry,
  VerificationResult,
  TrustGrade,
  HashEntrySchema,
  sha256,
  computeChainHash,
  nowISO,
} from '@proveit/shared';
import { log, logError } from '../utils/logger';

const HASH_CHAIN_FILE = 'hashchain.json';
const GENESIS_HASH = 'sha256:0000000000000000000000000000000000000000000000000000000000000000';

export class HashChain {
  private proveitDir: string;
  private chain: HashEntry[] = [];

  constructor(proveitDir: string) {
    this.proveitDir = proveitDir;
  }

  async load(): Promise<void> {
    const uri = vscode.Uri.file(path.join(this.proveitDir, HASH_CHAIN_FILE));
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      const data = JSON.parse(Buffer.from(bytes).toString('utf-8'));
      this.chain = (data as unknown[]).map((entry) => HashEntrySchema.parse(entry));
    } catch {
      this.chain = [];
    }
  }

  async append(sessionData: string): Promise<HashEntry> {
    const previousHash = this.chain.length > 0
      ? this.chain[this.chain.length - 1].hash
      : GENESIS_HASH;

    const timestamp = nowISO();
    const dataHash = sha256(sessionData);
    const hash = computeChainHash(previousHash, timestamp, dataHash);

    const entry: HashEntry = {
      index: this.chain.length,
      hash,
      previousHash,
      timestamp,
      dataHash,
    };

    this.chain.push(entry);
    await this.save();
    log(`Hash chain appended: index=${entry.index}`);
    return entry;
  }

  verify(): VerificationResult {
    if (this.chain.length === 0) {
      return {
        valid: true,
        grade: TrustGrade.MEDIUM,
        chainLength: 0,
        message: 'Empty chain — no sessions recorded yet.',
      };
    }

    for (let i = 0; i < this.chain.length; i++) {
      const entry = this.chain[i];
      const expectedPrevious = i === 0 ? GENESIS_HASH : this.chain[i - 1].hash;

      if (entry.previousHash !== expectedPrevious) {
        return {
          valid: false,
          grade: TrustGrade.LOW,
          chainLength: this.chain.length,
          brokenAt: i,
          message: `Chain broken at index ${i}: previousHash mismatch.`,
        };
      }

      const recomputedHash = computeChainHash(entry.previousHash, entry.timestamp, entry.dataHash);
      if (entry.hash !== recomputedHash) {
        return {
          valid: false,
          grade: TrustGrade.LOW,
          chainLength: this.chain.length,
          brokenAt: i,
          message: `Chain broken at index ${i}: hash mismatch.`,
        };
      }
    }

    return {
      valid: true,
      grade: this.chain.length >= 5 ? TrustGrade.HIGH : TrustGrade.MEDIUM,
      chainLength: this.chain.length,
      message: `Chain verified: ${this.chain.length} entries, all valid.`,
    };
  }

  getLatestHash(): string {
    return this.chain.length > 0
      ? this.chain[this.chain.length - 1].hash
      : GENESIS_HASH;
  }

  getLength(): number {
    return this.chain.length;
  }

  private async save(): Promise<void> {
    const uri = vscode.Uri.file(path.join(this.proveitDir, HASH_CHAIN_FILE));
    const content = JSON.stringify(this.chain, null, 2);
    try {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
    } catch (error) {
      logError('Failed to save hash chain', error);
    }
  }
}
