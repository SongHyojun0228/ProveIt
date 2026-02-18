import { describe, it, expect } from 'vitest';
import { nowISO, elapsedMs, generateId } from '../utils/time';

describe('nowISO', () => {
  it('returns valid ISO string', () => {
    const iso = nowISO();
    expect(() => new Date(iso)).not.toThrow();
    expect(new Date(iso).toISOString()).toBe(iso);
  });
});

describe('elapsedMs', () => {
  it('calculates elapsed time between two timestamps', () => {
    const start = '2024-01-01T00:00:00.000Z';
    const end = '2024-01-01T00:05:00.000Z';
    expect(elapsedMs(start, end)).toBe(300_000);
  });

  it('returns 0 for same timestamp', () => {
    const t = '2024-01-01T00:00:00.000Z';
    expect(elapsedMs(t, t)).toBe(0);
  });

  it('never returns negative', () => {
    const start = '2024-01-01T01:00:00.000Z';
    const end = '2024-01-01T00:00:00.000Z';
    expect(elapsedMs(start, end)).toBe(0);
  });
});

describe('generateId', () => {
  it('starts with given prefix', () => {
    const id = generateId('sess');
    expect(id.startsWith('sess_')).toBe(true);
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId('test')));
    expect(ids.size).toBe(100);
  });
});
