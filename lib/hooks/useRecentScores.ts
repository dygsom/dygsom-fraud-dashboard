/**
 * useRecentScores Hook
 *
 * Custom hook for fetching recent fraud detection scores with filters.
 * Automatically polls for updates every 10 seconds.
 *
 * @module lib/hooks/useRecentScores
 * @see {@link ../api/client.ts} for API client
 */

import useSWR from 'swr';
import { api } from '@/lib/api/client';
import type { ScoreResponse, PaginatedResponse } from '@/types/dashboard';

interface UseRecentScoresParams {
  limit?: number;
  offset?: number;
  action?: string;
  min_risk_score?: number;
  start_date?: string;
  end_date?: string;
}

export function useRecentScores(params?: UseRecentScoresParams) {
  const key = `/scores/recent?${JSON.stringify(params || {})}`;
  
  const { data, error, mutate, isLoading } = useSWR<PaginatedResponse<ScoreResponse>>(
    key,
    () => api.scores.recent(params),
    {
      refreshInterval: 10000, // Poll every 10 seconds
      revalidateOnFocus: true,
      dedupingInterval: 3000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    scores: data?.data || [],
    total: data?.total || 0,
    offset: data?.offset || 0,
    limit: data?.limit || 50,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
