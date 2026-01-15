/**
 * useDashboardMetrics Hook
 *
 * Custom hook for fetching and caching dashboard metrics using SWR.
 * Automatically polls for updates every 30 seconds.
 *
 * @module lib/hooks/useDashboardMetrics
 * @see {@link ../api/client.ts} for API client
 */

import useSWR from 'swr';
import { api } from '@/lib/api/client';
import type { DashboardMetrics } from '@/types/dashboard';

export function useDashboardMetrics() {
  const { data, error, mutate, isLoading } = useSWR<DashboardMetrics>(
    '/metrics',
    () => api.metrics.get(),
    {
      refreshInterval: 30000, // Poll every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
