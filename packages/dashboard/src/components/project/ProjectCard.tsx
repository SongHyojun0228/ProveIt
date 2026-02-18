import Link from 'next/link';
import { Card } from '@/components/shared/Card';

interface Project {
  projectId: string;
  projectName: string;
  sessionCount: number;
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${encodeURIComponent(project.projectId)}`}>
      <Card className="hover:border-brand-300 transition-colors cursor-pointer">
        <h3 className="text-sm font-semibold">{project.projectName}</h3>
        <p className="text-xs text-gray-500 mt-1">{project.sessionCount} sessions</p>
      </Card>
    </Link>
  );
}
