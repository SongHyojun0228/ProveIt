'use client';

import { use, useState } from 'react';
import { useSession, useSessionInsight } from '@/hooks/use-data';
import { MetricsGrid } from '@/components/session/MetricsGrid';
import { Timeline } from '@/components/session/Timeline';
import { SessionInsightView } from '@/components/session/SessionInsightView';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Card } from '@/components/shared/Card';
import { Loading } from '@/components/shared/Loading';
import { formatDateTime } from '@/lib/format';
import { api } from '@/lib/api';

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { data: session, isLoading } = useSession(sessionId);
  const {
    data: insight,
    isLoading: insightLoading,
    mutate: mutateInsight,
  } = useSessionInsight(sessionId);
  const [generating, setGenerating] = useState(false);

  if (isLoading) return <Loading />;
  if (!session) return <div className="text-sm text-gray-500">Session not found</div>;

  const s = session as any;

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await api.generateSessionInsight(sessionId);
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
        <h2 className="text-xl font-semibold font-mono">{s.id.slice(0, 20)}</h2>
        <Badge color={s.state === 'ended' ? 'green' : 'yellow'}>{s.state}</Badge>
      </div>
      <p className="text-sm text-gray-500 mb-4">{formatDateTime(s.startTime)}</p>

      <MetricsGrid metrics={s.metrics} duration={s.duration} />

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
          <SessionInsightView insight={insight as any} />
        ) : (
          <Card>
            <p className="text-sm text-gray-500">
              No insight yet. Click &quot;Generate Insight&quot; to analyze this session with AI.
            </p>
          </Card>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Event Timeline</h3>
        <Card>
          {s.events && s.events.length > 0 ? (
            <Timeline events={s.events} />
          ) : (
            <p className="text-sm text-gray-500">No events recorded.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
