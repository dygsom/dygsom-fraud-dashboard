/**
 * useDashboardMetrics Hook
 *
 * Hook para obtener métricas del dashboard (24h) del backend.
 * Usa SWR para caching automático y revalidación.
 *
 * Backend endpoint: GET /v1/metrics
 *
 * @module hooks/useDashboardMetrics
 */

'use client';

import useSWR from 'swr';
import { api } from '@/lib/api/client';
import type { DashboardMetrics } from '@/types/dashboard';

export interface UseDashboardMetricsOptions {
  /**
   * Intervalo de revalidación automática (ms)
   * @default 30000 (30 segundos)
   */
  refreshInterval?: number;

  /**
   * Revalidar cuando la ventana recibe focus
   * @default true
   */
  revalidateOnFocus?: boolean;
}

export interface UseDashboardMetricsReturn {
  metrics: DashboardMetrics | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Hook para obtener métricas del dashboard
 *
 * @example
 * ```tsx
 * function DashboardPage() {
 *   const { metrics, isLoading, isError } = useDashboardMetrics();
 *
 *   if (isLoading) return <Spinner />;
 *   if (isError) return <Error />;
 *
 *   return (
 *     <div>
 *       <p>Total: {metrics.totalDetections}</p>
 *       <p>Fraud Rate: {(metrics.fraudRate * 100).toFixed(2)}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDashboardMetrics(
  options: UseDashboardMetricsOptions = {}
): UseDashboardMetricsReturn {
  const {
    refreshInterval = 30000, // 30 segundos
    revalidateOnFocus = true,
  } = options;

  const { data, error, isLoading, mutate } = useSWR<DashboardMetrics>(
    '/metrics',
    () => api.metrics.get(),
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // No duplicar requests en 5s
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  };
}
