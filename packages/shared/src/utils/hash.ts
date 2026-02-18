import { createHash } from 'crypto';

export function sha256(data: string): string {
  return `sha256:${createHash('sha256').update(data).digest('hex')}`;
}

export function computeChainHash(previousHash: string, timestamp: string, dataHash: string): string {
  return sha256(`${previousHash}${timestamp}${dataHash}`);
}
