import { describe, it, expect } from 'vitest';
import { sha256, computeChainHash } from '../utils/hash';

describe('sha256', () => {
  it('produces consistent hashes', () => {
    const hash1 = sha256('hello');
    const hash2 = sha256('hello');
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different inputs', () => {
    const hash1 = sha256('hello');
    const hash2 = sha256('world');
    expect(hash1).not.toBe(hash2);
  });

  it('starts with sha256: prefix', () => {
    const hash = sha256('test');
    expect(hash.startsWith('sha256:')).toBe(true);
  });

  it('has correct hex length after prefix', () => {
    const hash = sha256('test');
    const hex = hash.slice('sha256:'.length);
    expect(hex).toHaveLength(64);
  });
});

describe('computeChainHash', () => {
  it('combines previous hash, timestamp, and data hash', () => {
    const prev = 'sha256:0000';
    const timestamp = '2024-01-01T00:00:00.000Z';
    const dataHash = sha256('session data');

    const result = computeChainHash(prev, timestamp, dataHash);
    expect(result.startsWith('sha256:')).toBe(true);
  });

  it('is deterministic', () => {
    const prev = 'sha256:abc';
    const timestamp = '2024-01-01T00:00:00.000Z';
    const dataHash = sha256('data');

    const result1 = computeChainHash(prev, timestamp, dataHash);
    const result2 = computeChainHash(prev, timestamp, dataHash);
    expect(result1).toBe(result2);
  });

  it('changes when any input changes', () => {
    const timestamp = '2024-01-01T00:00:00.000Z';
    const dataHash = sha256('data');

    const hash1 = computeChainHash('sha256:aaa', timestamp, dataHash);
    const hash2 = computeChainHash('sha256:bbb', timestamp, dataHash);
    expect(hash1).not.toBe(hash2);
  });
});
