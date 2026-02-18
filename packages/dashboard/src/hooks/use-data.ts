'use client';

import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

export function useSessions(limit = 50) {
  return useSWR(`/sessions?limit=${limit}`, swrFetcher);
}

export function useSession(id: string) {
  return useSWR(id ? `/sessions/${id}` : null, swrFetcher);
}

export function useProjects() {
  return useSWR('/projects', swrFetcher);
}

export function useProject(id: string) {
  return useSWR(id ? `/projects/${id}` : null, swrFetcher);
}

export function useSessionInsight(sessionId: string) {
  return useSWR(sessionId ? `/insights/session/${sessionId}` : null, swrFetcher, {
    revalidateOnFocus: false,
  });
}

export function useProjectInsight(projectId: string) {
  return useSWR(projectId ? `/insights/project/${projectId}` : null, swrFetcher, {
    revalidateOnFocus: false,
  });
}

export function useShareLinks(projectId: string) {
  return useSWR(projectId ? `/share/project/${projectId}` : null, swrFetcher);
}

export function useVerification(projectId: string) {
  return useSWR(projectId ? `/share/verify/${projectId}` : null, swrFetcher, {
    revalidateOnFocus: false,
  });
}

export function usePublicPortfolio(token: string) {
  return useSWR(token ? `/share/public/${token}` : null, swrFetcher, {
    revalidateOnFocus: false,
  });
}
