/**
 * useAnalytics Hook
 *
 * Hook para obtener datos de analytics (trends y distribución) del backend.
 * Usa SWR para caching automático.
 *
 * Backend endpoints:
 * - GET /v1/analytics/fraud-rate
 * - GET /v1/analytics/volume
 * - GET /v1/analytics/risk-distribution
 *
 * @module hooks/useAnalytics
 */

'use client';

import useSWR from 'swr';
import { api } from '@/lib/api/client';
import type {
  FraudRateTrend,
  VolumeTrend,
  RiskDistribution,
} from '@/types/dashboard';

export interface UseAnalyticsOptions {
  /**
   * Intervalo de revalidación automática (ms)
   * @default 60000 (1 minuto)
   */
  refreshInterval?: number;

  /**
   * Revalidar cuando la ventana recibe focus
   * @default false
   */
  revalidateOnFocus?: boolean;
}

export interface UseFraudRateTrendReturn {
  trend: FraudRateTrend[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export interface UseVolumeTrendReturn {
  trend: VolumeTrend[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export interface UseRiskDistributionReturn {
  distribution: RiskDistribution | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Hook para obtener tendencia de fraud rate
 *
 * @example
 * ```tsx
 * function FraudRateChart() {
 *   const { trend, isLoading } = useFraudRateTrend();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return <LineChart data={trend?.data} />;
 * }
 * ```
 */
export function useFraudRateTrend(
  options: UseAnalyticsOptions = {}
): UseFraudRateTrendReturn {
  const { refreshInterval = 60000, revalidateOnFocus = false } = options;

  const { data, error, isLoading, mutate } = useSWR<{ data: FraudRateTrend[] }>(
    '/analytics/fraud-rate',
    () => api.analytics.fraudRate(),
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    }
  );

  return {
    trend: data?.data,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  };
}

/**
 * Hook para obtener tendencia de volumen
 *
 * @example
 * ```tsx
 * function VolumeChart() {
 *   const { trend, isLoading } = useVolumeTrend();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return <BarChart data={trend?.data} />;
 * }
 * ```
 */
export function useVolumeTrend(
  options: UseAnalyticsOptions = {}
): UseVolumeTrendReturn {
  const { refreshInterval = 60000, revalidateOnFocus = false } = options;

  const { data, error, isLoading, mutate } = useSWR<{ data: VolumeTrend[] }>(
    '/analytics/volume',
    () => api.analytics.volume(),
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    }
  );

  return {
    trend: data?.data,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  };
}

/**
 * Hook para obtener distribución de riesgo
 *
 * @example
 * ```tsx
 * function RiskPieChart() {
 *   const { distribution, isLoading } = useRiskDistribution();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <PieChart
 *       data={[
 *         { name: 'Low', value: distribution.lowRisk },
 *         { name: 'Medium', value: distribution.mediumRisk },
 *         { name: 'High', value: distribution.highRisk },
 *       ]}
 *     />
 *   );
 * }
 * ```
 */
export function useRiskDistribution(
  options: UseAnalyticsOptions = {}
): UseRiskDistributionReturn {
  const { refreshInterval = 60000, revalidateOnFocus = false } = options;

  const { data, error, isLoading, mutate } = useSWR<{ distribution: RiskDistribution }>(
    '/analytics/risk-distribution',
    () => api.analytics.riskDistribution(),
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
    }
  );

  return {
    distribution: data?.distribution,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  };
}

/**
 * Hook combinado para obtener todos los datos de analytics
 *
 * @example
 * ```tsx
 * function AnalyticsDashboard() {
 *   const analytics = useAnalytics();
 *
 *   return (
 *     <div>
 *       <FraudRateChart trend={analytics.fraudRate.trend} />
 *       <VolumeChart trend={analytics.volume.trend} />
 *       <RiskChart distribution={analytics.riskDistribution.distribution} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const fraudRate = useFraudRateTrend(options);
  const volume = useVolumeTrend(options);
  const riskDistribution = useRiskDistribution(options);

  return {
    fraudRate,
    volume,
    riskDistribution,
    isLoading: fraudRate.isLoading || volume.isLoading || riskDistribution.isLoading,
    isError: fraudRate.isError || volume.isError || riskDistribution.isError,
  };
}
