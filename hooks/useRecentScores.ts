/**
 * useRecentScores Hook
 *
 * Hook para obtener fraud scores recientes (paginados) del backend.
 * Usa SWR para caching automático.
 *
 * Backend endpoint: GET /v1/scores/recent
 *
 * @module hooks/useRecentScores
 */

'use client';

import useSWR from 'swr';
import { api } from '@/lib/api/client';
import type { ScoreResponse, PaginatedResponse } from '@/types/dashboard';

export interface UseRecentScoresOptions {
  /**
   * Número de registros por página
   * @default 50
   */
  limit?: number;

  /**
   * Offset para paginación
   * @default 0
   */
  offset?: number;

  /**
   * Filtro por acción
   */
  action?: 'allow' | 'block' | 'challenge' | 'friction';

  /**
   * Intervalo de revalidación automática (ms)
   * @default 15000 (15 segundos)
   */
  refreshInterval?: number;
}

export interface UseRecentScoresReturn {
  scores: ScoreResponse[] | undefined;
  pagination: { limit: number; offset: number; total: number } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Hook para obtener fraud scores recientes
 *
 * @example
 * ```tsx
 * function RecentScoresTable() {
 *   const { scores, isLoading, pagination } = useRecentScores({
 *     limit: 20,
 *     offset: 0,
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *
 *   return (
 *     <table>
 *       {scores?.map(score => (
 *         <tr key={score.id}>
 *           <td>{score.transaction_id}</td>
 *           <td>{score.scores.fraud_score}</td>
 *           <td>{score.action}</td>
 *         </tr>
 *       ))}
 *     </table>
 *   );
 * }
 * ```
 */
export function useRecentScores(
  options: UseRecentScoresOptions = {}
): UseRecentScoresReturn {
  const {
    limit = 50,
    offset = 0,
    action,
    refreshInterval = 15000, // 15 segundos
  } = options;

  // Construir cache key única para cada combinación de parámetros
  const cacheKey = `/scores/recent?limit=${limit}&offset=${offset}${action ? `&action=${action}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<ScoreResponse>
  >(
    cacheKey,
    () => api.scores.recent({ limit, offset, action }),
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    scores: data?.data,
    pagination: data ? { total: data.total, offset: data.offset, limit: data.limit } : undefined,
    isLoading,
    isError: !!error,
    error: error as Error | undefined,
    mutate,
  };
}
