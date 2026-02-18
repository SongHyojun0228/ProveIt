'use client';

import { useSessions, useProjects } from '@/hooks/use-data';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentSessions } from '@/components/dashboard/RecentSessions';
import { Loading } from '@/components/shared/Loading';
import { Empty } from '@/components/shared/Empty';
import Link from 'next/link';
import { Card } from '@/components/shared/Card';

export default function HomePage() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  if (sessionsLoading || projectsLoading) return <Loading />;

  const sessionList = (sessions as any[]) || [];
  const projectList = (projects as any[]) || [];

  if (sessionList.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <Empty message="No sessions uploaded yet. Use VS Code to track and upload sessions." />
      </div>
    );
  }

  // Aggregate stats
  const stats = {
    totalSessions: sessionList.length,
    totalActiveTimeMs: sessionList.reduce((sum: number, s: any) => sum + s.duration.activeMs, 0),
    aiUsageRate:
      sessionList.reduce((sum: number, s: any) => sum + (s.metrics.aiCompletions.acceptRate || 0), 0) /
      sessionList.length,
    linesAdded: sessionList.reduce((sum: number, s: any) => sum + s.metrics.linesAdded, 0),
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <RecentSessions sessions={sessionList} />

        <Card>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Projects</h3>
          <div className="space-y-2">
            {projectList.map((p: any) => (
              <Link
                key={p.projectId}
                href={`/projects/${encodeURIComponent(p.projectId)}`}
                className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">{p.projectName}</span>
                <span className="text-xs text-gray-500">{p.sessionCount} sessions</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
