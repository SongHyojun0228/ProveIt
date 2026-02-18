'use client';

import { useSessions } from '@/hooks/use-data';
import { SessionCard } from '@/components/session/SessionCard';
import { Loading } from '@/components/shared/Loading';
import { Empty } from '@/components/shared/Empty';

export default function SessionsPage() {
  const { data: sessions, isLoading } = useSessions();

  if (isLoading) return <Loading />;

  const sessionList = (sessions as any[]) || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sessions</h2>
      {sessionList.length === 0 ? (
        <Empty message="No sessions uploaded yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessionList.map((s: any) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}
