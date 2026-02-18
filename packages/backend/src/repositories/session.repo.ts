import type { Session } from '@proveit/shared';
import { getDb } from '../db/connection';

interface SessionRow {
  id: string;
  project_id: string;
  project_name: string;
  start_time: string;
  end_time: string | null;
  state: string;
  duration_total_ms: number;
  duration_active_ms: number;
  duration_idle_ms: number;
  metrics_json: string;
  events_json: string;
  raw_json: string;
  created_at: string;
}

function rowToSession(row: SessionRow): Session {
  return JSON.parse(row.raw_json) as Session;
}

export const sessionRepo = {
  insert(session: Session, projectName: string): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO sessions (id, project_id, project_name, start_time, end_time, state,
        duration_total_ms, duration_active_ms, duration_idle_ms,
        metrics_json, events_json, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      session.id,
      session.projectId,
      projectName,
      session.startTime,
      session.endTime || null,
      session.state,
      session.duration.totalMs,
      session.duration.activeMs,
      session.duration.idleMs,
      JSON.stringify(session.metrics),
      JSON.stringify(session.events),
      JSON.stringify(session),
    );
  },

  findById(id: string): Session | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined;
    return row ? rowToSession(row) : null;
  },

  findAll(limit = 50, offset = 0): Session[] {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM sessions ORDER BY start_time DESC LIMIT ? OFFSET ?',
    ).all(limit, offset) as SessionRow[];
    return rows.map(rowToSession);
  },

  findByProject(projectId: string): Session[] {
    const db = getDb();
    const rows = db.prepare(
      'SELECT * FROM sessions WHERE project_id = ? ORDER BY start_time DESC',
    ).all(projectId) as SessionRow[];
    return rows.map(rowToSession);
  },

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    return result.changes > 0;
  },

  getProjectList(): Array<{ projectId: string; projectName: string; sessionCount: number }> {
    const db = getDb();
    return db.prepare(`
      SELECT project_id as projectId, project_name as projectName, COUNT(*) as sessionCount
      FROM sessions
      GROUP BY project_id
      ORDER BY MAX(start_time) DESC
    `).all() as Array<{ projectId: string; projectName: string; sessionCount: number }>;
  },

  getProjectStats(projectId: string) {
    const db = getDb();
    const row = db.prepare(`
      SELECT
        COUNT(*) as totalSessions,
        COALESCE(SUM(duration_active_ms), 0) as totalActiveTimeMs,
        COALESCE(AVG(duration_active_ms), 0) as avgSessionLengthMs
      FROM sessions
      WHERE project_id = ?
    `).get(projectId) as { totalSessions: number; totalActiveTimeMs: number; avgSessionLengthMs: number };
    return row;
  },
};
