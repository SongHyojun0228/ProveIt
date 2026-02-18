'use client';

import { Card } from '@/components/shared/Card';
import { CapabilityTags } from './CapabilityTags';

interface ProjectInsight {
  narrative: string;
  capabilities: Array<{ name: string; category: string; proficiency: string; evidence: string }>;
  strengths: string[];
  growthAreas: string[];
  workStyle: string;
}

export function InsightView({ insight }: { insight: ProjectInsight }) {
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Narrative</h3>
        <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
          {insight.narrative}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h3>
        <CapabilityTags capabilities={insight.capabilities} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-medium text-green-700 mb-2">Strengths</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {insight.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">+</span>
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-amber-700 mb-2">Growth Areas</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {insight.growthAreas.map((g, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">~</span>
                {g}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-gray-700 mb-1">Work Style</h3>
        <p className="text-sm text-gray-600">{insight.workStyle}</p>
      </Card>
    </div>
  );
}
