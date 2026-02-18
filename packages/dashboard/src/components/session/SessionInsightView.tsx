'use client';

import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';

interface Highlight {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  significance: string;
}

interface KeyDecision {
  description: string;
  alternatives: string[];
  reasoning: string;
  timestamp: string;
}

interface SessionInsight {
  summary: string;
  highlights: Highlight[];
  aiUsageRate: number;
  keyDecisions: KeyDecision[];
  techStack: string[];
}

const significanceColor: Record<string, string> = {
  high: 'red',
  medium: 'yellow',
  low: 'gray',
};

export function SessionInsightView({ insight }: { insight: SessionInsight }) {
  return (
    <div className="space-y-4">
      <Card>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
        <p className="text-sm text-gray-600">{insight.summary}</p>
      </Card>

      {insight.techStack.length > 0 && (
        <Card>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Tech Stack</h4>
          <div className="flex flex-wrap gap-1.5">
            {insight.techStack.map((t) => (
              <Badge key={t} color="blue">{t}</Badge>
            ))}
          </div>
        </Card>
      )}

      {insight.highlights.length > 0 && (
        <Card>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Highlights</h4>
          <div className="space-y-2">
            {insight.highlights.map((h, i) => (
              <div key={i} className="border-l-2 border-brand-200 pl-3 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{h.title}</span>
                  <Badge color={significanceColor[h.significance] || 'gray'}>{h.significance}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{h.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {insight.keyDecisions.length > 0 && (
        <Card>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Decisions</h4>
          <div className="space-y-3">
            {insight.keyDecisions.map((d, i) => (
              <div key={i} className="text-sm">
                <p className="font-medium text-gray-700">{d.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">{d.reasoning}</p>
                {d.alternatives.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Alternatives: {d.alternatives.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
