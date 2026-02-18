import type { ShareLink } from '@proveit/shared';
import { getDb } from '../db/connection';

interface ShareLinkRow {
  id: string;
  project_id: string;
  token: string;
  created_at: string;
  expires_at: string | null;
  is_active: number;
}

function rowToShareLink(row: ShareLinkRow): ShareLink {
  return {
    id: row.id,
    projectId: row.project_id,
    token: row.token,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    isActive: row.is_active === 1,
  };
}

export const shareRepo = {
  insert(link: ShareLink): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO share_links (id, project_id, token, created_at, expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      link.id,
      link.projectId,
      link.token,
      link.createdAt,
      link.expiresAt,
      link.isActive ? 1 : 0,
    );
  },

  findByToken(token: string): ShareLink | null {
    const db = getDb();
    const row = db.prepare(
      'SELECT * FROM share_links WHERE token = ? AND is_active = 1',
    ).get(token) as ShareLinkRow | undefined;
    return row ? rowToShareLink(row) : null;
  },

  findByProject(projectId: string): ShareLink[] {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM share_links WHERE project_id = ? ORDER BY created_at DESC',
    ).all(projectId) as ShareLinkRow[];
    return rows.map(rowToShareLink);
  },

  deactivate(id: string): boolean {
    const db = getDb();
    const result = db.prepare(
      'UPDATE share_links SET is_active = 0 WHERE id = ?',
    ).run(id);
    return result.changes > 0;
  },
};
