'use client';

import { useProjects } from '@/hooks/use-data';
import { ProjectCard } from '@/components/project/ProjectCard';
import { Loading } from '@/components/shared/Loading';
import { Empty } from '@/components/shared/Empty';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <Loading />;

  const projectList = (projects as any[]) || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      {projectList.length === 0 ? (
        <Empty message="No projects yet. Upload sessions from VS Code." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.map((p: any) => (
            <ProjectCard key={p.projectId} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
