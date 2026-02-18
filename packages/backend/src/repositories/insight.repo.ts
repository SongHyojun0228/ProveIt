import type { SessionInsight, ProjectInsight } from '@proveit/shared';
import { getDb } from '../db/connection';

export const insightRepo = {
  // Session insights
  upsertSessionInsight(insight: SessionInsight): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO session_insights (id, session_id, project_id, status, summary,
        highlights_json, ai_usage_rate, key_decisions_json, tech_stack_json, error)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        status = excluded.status,
        summary = excluded.summary,
        highlights_json = excluded.highlights_json,
        ai_usage_rate = excluded.ai_usage_rate,
        key_decisions_json = excluded.key_decisions_json,
        tech_stack_json = excluded.tech_stack_json,
        error = excluded.error
    `).run(
      insight.id,
      insight.sessionId,
      insight.projectId,
      insight.status,
      insight.summary,
      JSON.stringify(insight.highlights),
      insight.aiUsageRate,
      JSON.stringify(insight.keyDecisions),
      JSON.stringify(insight.techStack),
      insight.error || null,
    );
  },

  findSessionInsight(sessionId: string): SessionInsight | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM session_insights WHERE session_id = ?').get(sessionId) as any;
    if (!row) return null;
    return {
      id: row.id,
      sessionId: row.session_id,
      projectId: row.project_id,
      status: row.status,
      createdAt: row.created_at,
      summary: row.summary,
      highlights: JSON.parse(row.highlights_json),
      aiUsageRate: row.ai_usage_rate,
      keyDecisions: JSON.parse(row.key_decisions_json),
      techStack: JSON.parse(row.tech_stack_json),
      error: row.error || undefined,
    };
  },

  findSessionInsightsByProject(projectId: string): SessionInsight[] {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM session_insights WHERE project_id = ?').all(projectId) as any[];
    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      projectId: row.project_id,
      status: row.status,
      createdAt: row.created_at,
      summary: row.summary,
      highlights: JSON.parse(row.highlights_json),
      aiUsageRate: row.ai_usage_rate,
      keyDecisions: JSON.parse(row.key_decisions_json),
      techStack: JSON.parse(row.tech_stack_json),
      error: row.error || undefined,
    }));
  },

  // Project insights
  upsertProjectInsight(insight: ProjectInsight): void {
    const db = getDb();
    db.prepare(`
      INSERT INTO project_insights (id, project_id, status, summary_json, narrative,
        capabilities_json, strengths_json, growth_areas_json, work_style, error, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(project_id) DO UPDATE SET
        status = excluded.status,
        summary_json = excluded.summary_json,
        narrative = excluded.narrative,
        capabilities_json = excluded.capabilities_json,
        strengths_json = excluded.strengths_json,
        growth_areas_json = excluded.growth_areas_json,
        work_style = excluded.work_style,
        error = excluded.error,
        updated_at = datetime('now')
    `).run(
      insight.id,
      insight.projectId,
      insight.status,
      JSON.stringify(insight.summary),
      insight.narrative,
      JSON.stringify(insight.capabilities),
      JSON.stringify(insight.strengths),
      JSON.stringify(insight.growthAreas),
      insight.workStyle,
      insight.error || null,
    );
  },

  findProjectInsight(projectId: string): ProjectInsight | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM project_insights WHERE project_id = ?').get(projectId) as any;
    if (!row) return null;
    return {
      id: row.id,
      projectId: row.project_id,
      status: row.status,
      createdAt: row.created_at,
      summary: JSON.parse(row.summary_json),
      narrative: row.narrative,
      capabilities: JSON.parse(row.capabilities_json),
      strengths: JSON.parse(row.strengths_json),
      growthAreas: JSON.parse(row.growth_areas_json),
      workStyle: row.work_style,
      error: row.error || undefined,
    };
  },
};
