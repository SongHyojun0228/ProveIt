import type { Session, ProjectSummary, SessionInsight } from '@proveit/shared';

export function buildProjectInsightPrompt(
  projectName: string,
  summary: ProjectSummary,
  sessions: Session[],
  sessionInsights: SessionInsight[],
): string {
  const totalHours = (summary.totalActiveTimeMs / 3_600_000).toFixed(1);
  const aiPct = (summary.aiUsageRate * 100).toFixed(1);

  const sessionSummaries = sessionInsights
    .filter((i) => i.status === 'completed')
    .map((i) => `- ${i.summary} (AI: ${(i.aiUsageRate * 100).toFixed(0)}%, tech: ${i.techStack.join(', ')})`)
    .join('\n');

  const allTechStack = [...new Set(sessionInsights.flatMap((i) => i.techStack))];

  return `You are an expert at synthesizing developer work into compelling portfolio narratives. Analyze the following project data and produce a comprehensive project insight.

## Project: ${projectName}
- Total work time: ${totalHours} hours across ${summary.totalSessions} sessions
- Average session: ${Math.round(summary.avgSessionLengthMs / 60_000)} minutes
- Lines of code: +${summary.linesAdded} / -${summary.linesDeleted}
- Commits: ${summary.commits}
- AI completion acceptance rate: ${aiPct}%
- Errors encountered: ${summary.errorsEncountered}, resolved: ${summary.errorsResolved}
- Tech stack detected: ${allTechStack.join(', ')}

## Session Summaries
${sessionSummaries || '(no session insights yet)'}

## Instructions
Return a JSON object with this exact structure:
{
  "narrative": "2-4 paragraph narrative describing how this project was built, the developer's approach, and what it demonstrates about their capabilities. Write in third person.",
  "capabilities": [
    {
      "name": "TypeScript",
      "category": "language|framework|tool|skill|pattern",
      "proficiency": "beginner|intermediate|advanced|expert",
      "evidence": "brief evidence from the data"
    }
  ],
  "strengths": ["strength 1", "strength 2"],
  "growthAreas": ["area for improvement 1"],
  "workStyle": "1-2 sentence description of how this developer works (systematic, exploratory, test-driven, etc.)"
}

Rules:
- Base everything on data. Do not invent or exaggerate.
- Capabilities should be inferred from actual usage frequency and patterns.
- Strengths and growth areas must be supported by evidence.
- The narrative should be engaging but honest — suitable for a portfolio page.
- Include 3-8 capabilities, 2-4 strengths, and 1-3 growth areas.
- Return ONLY valid JSON, no markdown fences.`;
}
