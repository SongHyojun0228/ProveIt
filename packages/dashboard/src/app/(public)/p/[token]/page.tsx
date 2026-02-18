'use client';

import { use } from 'react';
import { usePublicPortfolio } from '@/hooks/use-data';
import { TrustBadge } from '@/components/shared/TrustBadge';
import { InsightView } from '@/components/project/InsightView';
import { Card } from '@/components/shared/Card';
import { Loading } from '@/components/shared/Loading';
import { formatDate, formatDuration, formatPercent } from '@/lib/format';

export default function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data, isLoading, error } = usePublicPortfolio(token);

  if (isLoading) return <Loading />;
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">This portfolio link is invalid or has expired.</p>
      </div>
    );
  }
  if (!data) return null;

  const portfolio = data as any;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{portfolio.projectName}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Shared on {formatDate(portfolio.sharedAt)}
        </p>
      </div>

      <div className="mb-6">
        <TrustBadge
          grade={portfolio.verification.grade}
          chainLength={portfolio.verification.chainLength}
          message={portfolio.verification.message}
        />
      </div>

      {portfolio.insight.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <p className="text-xs text-gray-500">Sessions</p>
            <p className="text-lg font-semibold">{portfolio.insight.summary.totalSessions}</p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Active Time</p>
            <p className="text-lg font-semibold">
              {formatDuration(portfolio.insight.summary.totalActiveTimeMs)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">AI Usage</p>
            <p className="text-lg font-semibold">
              {formatPercent(portfolio.insight.summary.aiUsageRate)}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-gray-500">Commits</p>
            <p className="text-lg font-semibold">{portfolio.insight.summary.commits}</p>
          </Card>
        </div>
      )}

      <InsightView insight={portfolio.insight} />
    </div>
  );
}
