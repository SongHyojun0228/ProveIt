import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      project_name TEXT NOT NULL DEFAULT '',
      start_time TEXT NOT NULL,
      end_time TEXT,
      state TEXT NOT NULL,
      duration_total_ms INTEGER NOT NULL DEFAULT 0,
      duration_active_ms INTEGER NOT NULL DEFAULT 0,
      duration_idle_ms INTEGER NOT NULL DEFAULT 0,
      metrics_json TEXT NOT NULL DEFAULT '{}',
      events_json TEXT NOT NULL DEFAULT '[]',
      raw_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);

    CREATE TABLE IF NOT EXISTS session_insights (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL UNIQUE,
      project_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      summary TEXT NOT NULL DEFAULT '',
      highlights_json TEXT NOT NULL DEFAULT '[]',
      ai_usage_rate REAL NOT NULL DEFAULT 0,
      key_decisions_json TEXT NOT NULL DEFAULT '[]',
      tech_stack_json TEXT NOT NULL DEFAULT '[]',
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_session_insights_session_id ON session_insights(session_id);
    CREATE INDEX IF NOT EXISTS idx_session_insights_project_id ON session_insights(project_id);

    CREATE TABLE IF NOT EXISTS project_insights (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      summary_json TEXT NOT NULL DEFAULT '{}',
      narrative TEXT NOT NULL DEFAULT '',
      capabilities_json TEXT NOT NULL DEFAULT '[]',
      strengths_json TEXT NOT NULL DEFAULT '[]',
      growth_areas_json TEXT NOT NULL DEFAULT '[]',
      work_style TEXT NOT NULL DEFAULT '',
      error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_project_insights_project_id ON project_insights(project_id);

    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
    CREATE INDEX IF NOT EXISTS idx_share_links_project_id ON share_links(project_id);

    CREATE TABLE IF NOT EXISTS hash_chain_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      entry_index INTEGER NOT NULL,
      hash TEXT NOT NULL,
      previous_hash TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data_hash TEXT NOT NULL,
      session_id TEXT NOT NULL,
      UNIQUE(project_id, entry_index)
    );

    CREATE INDEX IF NOT EXISTS idx_hash_chain_project_id ON hash_chain_entries(project_id);
  `);
}
