import type { HashEntry } from '@proveit/shared';
import { getDb } from '../db/connection';

interface HashChainRow {
  id: number;
  project_id: string;
  entry_index: number;
  hash: string;
  previous_hash: string;
  timestamp: string;
  data_hash: string;
  session_id: string;
}

function rowToHashEntry(row: HashChainRow): HashEntry & { sessionId: string } {
  return {
    index: row.entry_index,
    hash: row.hash,
    previousHash: row.previous_hash,
    timestamp: row.timestamp,
    dataHash: row.data_hash,
    sessionId: row.session_id,
  };
}

export const hashchainRepo = {
  insertEntry(projectId: string, entry: HashEntry, sessionId: string): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO hash_chain_entries (project_id, entry_index, hash, previous_hash, timestamp, data_hash, session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      entry.index,
      entry.hash,
      entry.previousHash,
      entry.timestamp,
      entry.dataHash,
      sessionId,
    );
  },

  findByProject(projectId: string): Array<HashEntry & { sessionId: string }> {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM hash_chain_entries WHERE project_id = ? ORDER BY entry_index ASC',
    ).all(projectId) as HashChainRow[];
    return rows.map(rowToHashEntry);
  },

  getChainLength(projectId: string): number {
    const db = getDb();
    const row = db.prepare(
      'SELECT COUNT(*) as count FROM hash_chain_entries WHERE project_id = ?',
    ).get(projectId) as { count: number };
    return row.count;
  },
};
