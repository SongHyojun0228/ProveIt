const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getSessions: (limit = 50, offset = 0) =>
    fetcher<any[]>(`/sessions?limit=${limit}&offset=${offset}`),

  getSession: (id: string) => fetcher<any>(`/sessions/${id}`),

  getProjects: () =>
    fetcher<Array<{ projectId: string; projectName: string; sessionCount: number }>>('/projects'),

  getProject: (id: string) =>
    fetcher<{ projectId: string; projectName: string; summary: any; sessionCount: number }>(
      `/projects/${id}`,
    ),

  getSessionInsight: (sessionId: string) => fetcher<any>(`/insights/session/${sessionId}`),

  generateSessionInsight: (sessionId: string) =>
    fetch(`${API_BASE}/insights/session/${sessionId}/generate`, { method: 'POST' }).then(
      async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
        }
        return res.json();
      },
    ),

  getProjectInsight: (projectId: string) => fetcher<any>(`/insights/project/${projectId}`),

  generateProjectInsight: (projectId: string) =>
    fetch(`${API_BASE}/insights/project/${projectId}/generate`, { method: 'POST' }).then(
      async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
        }
        return res.json();
      },
    ),

  // Share
  createShareLink: (projectId: string, expiresAt?: string) =>
    fetch(`${API_BASE}/share/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, expiresAt }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
      }
      return res.json();
    }),

  getShareLinks: (projectId: string) => fetcher<any[]>(`/share/project/${projectId}`),

  revokeShareLink: (id: string) =>
    fetch(`${API_BASE}/share/${id}`, { method: 'DELETE' }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
      }
      return res.json();
    }),

  getPublicPortfolio: (token: string) => fetcher<any>(`/share/public/${token}`),

  getVerification: (projectId: string) => fetcher<any>(`/share/verify/${projectId}`),
};

// SWR fetcher
export const swrFetcher = (url: string) => fetcher(url);
