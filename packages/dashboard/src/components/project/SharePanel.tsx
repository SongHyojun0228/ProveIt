'use client';

import { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useShareLinks } from '@/hooks/use-data';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';

interface SharePanelProps {
  projectId: string;
  hasInsight: boolean;
}

export function SharePanel({ projectId, hasInsight }: SharePanelProps) {
  const { data: links, mutate } = useShareLinks(projectId);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    try {
      await api.createShareLink(projectId);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await api.revokeShareLink(id);
      mutate();
    } catch (err) {
      console.error(err);
    }
  }

  function handleCopy(token: string) {
    const url = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  const activeLinks = (links as any[] || []).filter((l: any) => l.isActive);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Share</h3>
        <Button
          onClick={handleCreate}
          disabled={creating || !hasInsight}
          variant="secondary"
          className="text-xs px-3 py-1.5"
        >
          {creating ? 'Creating...' : 'Create Link'}
        </Button>
      </div>

      {!hasInsight && (
        <p className="text-xs text-gray-500 mb-2">
          Generate a project insight first to enable sharing.
        </p>
      )}

      {activeLinks.length === 0 && hasInsight && (
        <p className="text-xs text-gray-500">No share links yet. Create one to share your portfolio.</p>
      )}

      {activeLinks.length > 0 && (
        <div className="space-y-2">
          {activeLinks.map((link: any) => (
            <div
              key={link.id}
              className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50 border border-gray-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 truncate font-mono">
                  /p/{link.token.slice(0, 12)}...
                </p>
                <p className="text-xs text-gray-400">{formatDateTime(link.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(link.token)}
                  className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  {copied === link.token ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => handleRevoke(link.id)}
                  className="text-xs px-2 py-1 rounded bg-white border border-gray-200 text-red-600 hover:bg-red-50"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
