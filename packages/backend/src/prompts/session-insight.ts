import type { Session } from '@proveit/shared';

export function buildSessionInsightPrompt(session: Session): string {
  const durationMin = Math.round(session.duration.activeMs / 60_000);
  const { metrics } = session;
  const totalAI = metrics.aiCompletions.accepted + metrics.aiCompletions.rejected + metrics.aiCompletions.modified;
  const aiRate = totalAI > 0 ? ((metrics.aiCompletions.accepted / totalAI) * 100).toFixed(1) : '0';

  const eventSummary = session.events
    .slice(0, 200)
    .map((e) => `[${e.timestamp}] ${e.type}: ${JSON.stringify(e.data)}`)
    .join('\n');

  return `You are an expert at analyzing developer work sessions. Analyze the following coding session and produce structured insights.

## Session Overview
- Duration: ${durationMin} minutes active
- Files modified: ${metrics.filesModified}
- Lines added: ${metrics.linesAdded}, deleted: ${metrics.linesDeleted}
- Commits: ${metrics.commits}
- AI completions: ${totalAI} total (${aiRate}% acceptance rate)
- Errors encountered: ${metrics.errorsEncountered}, resolved: ${metrics.errorsResolved}
- Terminal commands: ${metrics.terminalCommands}

## Event Timeline (chronological)
${eventSummary}

## Instructions
Analyze the session and return a JSON object with this exact structure:
{
  "summary": "1-2 sentence summary of what was accomplished in this session",
  "highlights": [
    {
      "type": "decision|debugging|refactor|breakthrough|ai_usage",
      "title": "short title",
      "description": "what happened and why it matters",
      "timestamp": "ISO timestamp from the events",
      "significance": "high|medium|low"
    }
  ],
  "aiUsageRate": 0.35,
  "keyDecisions": [
    {
      "description": "what was decided",
      "alternatives": ["other option considered"],
      "reasoning": "why this choice was made",
      "timestamp": "ISO timestamp"
    }
  ],
  "techStack": ["TypeScript", "React", ...]
}

Rules:
- Be factual, not promotional. Describe what happened, not how great it is.
- Extract tech stack from file extensions and terminal commands.
- Identify 2-5 highlights maximum.
- Key decisions should only include clear architectural or design choices visible in the events.
- AI usage rate should be a decimal between 0 and 1.
- Return ONLY valid JSON, no markdown fences.`;
}
