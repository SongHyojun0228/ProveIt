import type { Session, ProjectSummary, EventType } from '@proveit/shared';

export const sessionAggregator = {
  aggregateProject(sessions: Session[]): ProjectSummary {
    const totalSessions = sessions.length;
    let totalActiveTimeMs = 0;
    let totalEvents = 0;
    let linesAdded = 0;
    let linesDeleted = 0;
    let commits = 0;
    let errorsEncountered = 0;
    let errorsResolved = 0;
    let aiAccepted = 0;
    let aiRejected = 0;
    let aiModified = 0;
    let aiToolLinesAdded = 0;
    let aiToolLinesDeleted = 0;

    for (const session of sessions) {
      totalActiveTimeMs += session.duration.activeMs;
      totalEvents += session.events.length;
      linesAdded += session.metrics.linesAdded;
      linesDeleted += session.metrics.linesDeleted;
      commits += session.metrics.commits;
      errorsEncountered += session.metrics.errorsEncountered;
      errorsResolved += session.metrics.errorsResolved;
      aiAccepted += session.metrics.aiCompletions.accepted;
      aiRejected += session.metrics.aiCompletions.rejected;
      aiModified += session.metrics.aiCompletions.modified;
      if (session.metrics.aiToolEdits) {
        aiToolLinesAdded += session.metrics.aiToolEdits.linesAdded;
        aiToolLinesDeleted += session.metrics.aiToolEdits.linesDeleted;
      }
    }

    const totalAI = aiAccepted + aiRejected + aiModified;
    const aiUsageRate = totalAI > 0 ? aiAccepted / totalAI : 0;
    const avgSessionLengthMs = totalSessions > 0 ? totalActiveTimeMs / totalSessions : 0;

    return {
      totalSessions,
      totalActiveTimeMs,
      totalEvents,
      avgSessionLengthMs,
      aiUsageRate,
      linesAdded,
      linesDeleted,
      commits,
      errorsEncountered,
      errorsResolved,
    };
  },
};
