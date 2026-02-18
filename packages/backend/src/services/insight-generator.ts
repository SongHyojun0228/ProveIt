import Anthropic from '@anthropic-ai/sdk';
import type { Session, SessionInsight, ProjectInsight, ProjectSummary } from '@proveit/shared';
import { generateId, nowISO } from '@proveit/shared';
import { config } from '../config';
import { buildSessionInsightPrompt } from '../prompts/session-insight';
import { buildProjectInsightPrompt } from '../prompts/project-insight';

function getClient(): Anthropic {
  if (!config.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({ apiKey: config.anthropicApiKey });
}

function parseJsonResponse(text: string): unknown {
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned);
}

export const insightGenerator = {
  async generateSessionInsight(session: Session): Promise<SessionInsight> {
    const client = getClient();
    const prompt = buildSessionInsightPrompt(session);

    const response = await client.messages.create({
      model: config.sessionModel,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseJsonResponse(text) as {
      summary: string;
      highlights: SessionInsight['highlights'];
      aiUsageRate: number;
      keyDecisions: SessionInsight['keyDecisions'];
      techStack: string[];
    };

    return {
      id: generateId('si'),
      sessionId: session.id,
      projectId: session.projectId,
      status: 'completed',
      createdAt: nowISO(),
      summary: parsed.summary,
      highlights: parsed.highlights || [],
      aiUsageRate: parsed.aiUsageRate || 0,
      keyDecisions: parsed.keyDecisions || [],
      techStack: parsed.techStack || [],
    };
  },

  async generateProjectInsight(
    projectId: string,
    projectName: string,
    summary: ProjectSummary,
    sessions: Session[],
    sessionInsights: SessionInsight[],
  ): Promise<ProjectInsight> {
    const client = getClient();
    const prompt = buildProjectInsightPrompt(projectName, summary, sessions, sessionInsights);

    const response = await client.messages.create({
      model: config.projectModel,
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseJsonResponse(text) as {
      narrative: string;
      capabilities: ProjectInsight['capabilities'];
      strengths: string[];
      growthAreas: string[];
      workStyle: string;
    };

    return {
      id: generateId('pi'),
      projectId,
      status: 'completed',
      createdAt: nowISO(),
      summary,
      narrative: parsed.narrative,
      capabilities: parsed.capabilities || [],
      strengths: parsed.strengths || [],
      growthAreas: parsed.growthAreas || [],
      workStyle: parsed.workStyle || '',
    };
  },
};
