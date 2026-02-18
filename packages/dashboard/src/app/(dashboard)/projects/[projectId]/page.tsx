'use client';

import { use, useState } from 'react';
import { useProject, useProjectInsight, useVerification } from '@/hooks/use-data';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { InsightView } from '@/components/project/InsightView';
import { SharePanel } from '@/components/project/SharePanel';
import { TrustBadge } from '@/components/shared/TrustBadge';
import { Button } from '@/components/shared/Button';
import { Loading } from '@/components/shared/Loading';
import { Card } from '@/components/shared/Card';
import { api } from '@/lib/api';
import { formatDuration } from '@/lib/format';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project, isLoading } = useProject(projectId);
  const {
    data: insight,
    isLoading: insightLoading,
    mutate: mutateInsight,
  } = useProjectInsight(projectId);
  const { data: verification } = useVerification(projectId);
  const [generating, setGenerating] = useState(false);

  if (isLoading) return <Loading />;
  if (!project) return <div className="text-sm text-gray-500">Project not found</div>;

  const proj = project as any;
  const summary = proj.summary;

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await api.generateProjectInsight(projectId);
      mutateInsight(result, false);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-semibold">{proj.projectName}</h2>
        {verification ? (
          <TrustBadge
            grade={(verification as any).grade}
            chainLength={(verification as any).chainLength}
            compact
          />
        ) : null}
      </div>
      <p className="text-sm text-gray-500 mb-4">{proj.sessionCount} sessions</p>

      {verification ? (
        <div className="mb-4">
          <TrustBadge
            grade={(verification as any).grade}
            chainLength={(verification as any).chainLength}
            message={(verification as any).message}
          />
        </div>
      ) : null}

      <StatsCards
        stats={{
          totalSessions: summary.totalSessions,
          totalActiveTimeMs: summary.totalActiveTimeMs,
          aiUsageRate: summary.aiUsageRate,
          linesAdded: summary.linesAdded,
        }}
      />

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-gray-500">Lines Deleted</p>
          <p className="text-lg font-semibold">{summary.linesDeleted}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Commits</p>
          <p className="text-lg font-semibold">{summary.commits}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Errors Resolved</p>
          <p className="text-lg font-semibold">
            {summary.errorsResolved}/{summary.errorsEncountered}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Avg Session</p>
          <p className="text-lg font-semibold">{formatDuration(summary.avgSessionLengthMs)}</p>
        </Card>
      </div>

      <div className="mt-6">
        <SharePanel projectId={projectId} hasInsight={!!insight} />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Insight</h3>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : insight ? 'Regenerate' : 'Generate Insight'}
          </Button>
        </div>

        {insightLoading ? (
          <Loading text="Loading insight..." />
        ) : insight ? (
          <InsightView insight={insight as any} />
        ) : (
          <Card>
            <p className="text-sm text-gray-500">
              No insight generated yet. Click &quot;Generate Insight&quot; to analyze this project
              with AI.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
