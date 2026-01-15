'use client';

/**
 * Dashboard Overview Page
 *
 * Main dashboard page showing fraud detection metrics with 4 pillar visualization.
 * Includes latest score, pillar charts, and detailed signals.
 *
 * @module app/(dashboard)
 */

import { useDashboardMetrics, useRecentScores } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/MetricCard';
import { RiskScoreGauge } from '@/components/charts/RiskScoreGauge';
import { PillarScoresChart } from '@/components/charts/PillarScoresChart';
import { PillarSignalsCard } from '@/components/charts/PillarSignalsCard';
import { formatNumber, formatPercentage } from '@/lib/utils/format';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { metrics, isLoading: metricsLoading, isError: metricsError, mutate: refreshMetrics } = useDashboardMetrics();
  const { scores, isLoading: scoresLoading, isError: scoresError, mutate: refreshScores } = useRecentScores({ limit: 1 });

  // Combined loading state
  const isLoading = metricsLoading || scoresLoading;
  const isError = metricsError || scoresError;

  // Latest score for visualization
  const latestScore = scores?.[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-slate-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <Card className="bg-red-900/10 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-400">Error al cargar el dashboard. Intente nuevamente.</p>
            <button
              onClick={() => {
                refreshMetrics();
                refreshScores();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const totalActions = metrics.actions_distribution.allow + metrics.actions_distribution.block;
  const blockRate = totalActions > 0 ? (metrics.actions_distribution.block / totalActions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Vista general de detección de fraude - Últimas 24 horas</p>
        </div>
        <button
          onClick={() => {
            refreshMetrics();
            refreshScores();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Latest Score Section */}
      {latestScore && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Score Gauge */}
          <div className="lg:col-span-1">
            <RiskScoreGauge score={latestScore.risk_score} action={latestScore.action} />
          </div>

          {/* Pillar Scores Chart */}
          <div className="lg:col-span-2">
            <PillarScoresChart scores={latestScore.pillar_scores} />
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Solicitudes"
          value={formatNumber(metrics.total_requests_24h)}
          subtitle="Últimas 24 horas"
        />

        <MetricCard
          title="Bloqueados"
          value={formatNumber(metrics.actions_distribution.block)}
          subtitle="Acción: BLOCK"
          valueColor="text-red-500"
        />

        <MetricCard
          title="Permitidos"
          value={formatNumber(metrics.actions_distribution.allow)}
          subtitle="Acción: ALLOW"
          valueColor="text-green-500"
        />

        <MetricCard
          title="Tasa de Bloqueo"
          value={formatPercentage(blockRate)}
          subtitle="Últimas 24 horas"
          valueColor="text-orange-500"
        />
      </div>

      {/* Pillar Signals (if available) */}
      {latestScore?.signals && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Señales Detalladas - Última Detección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PillarSignalsCard 
              pillarType="bot_detection" 
              signals={latestScore.signals.bot_detection} 
            />
            <PillarSignalsCard 
              pillarType="account_takeover" 
              signals={latestScore.signals.account_takeover} 
            />
            <PillarSignalsCard 
              pillarType="api_security" 
              signals={latestScore.signals.api_security} 
            />
            <PillarSignalsCard 
              pillarType="fraud_ml" 
              signals={latestScore.signals.fraud_ml} 
            />
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Score de Riesgo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">
              {(metrics.avg_risk_score_24h * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-slate-500 mt-1">Promedio últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Latencia Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{metrics.avg_latency_ms_24h.toFixed(0)} ms</p>
            <p className="text-sm text-slate-500 mt-1">Tiempo de respuesta promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Distribution */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Distribución de Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">Permitir</p>
              <p className="text-2xl font-bold text-green-500">{formatNumber(metrics.actions_distribution.allow)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Bloquear</p>
              <p className="text-2xl font-bold text-red-500">{formatNumber(metrics.actions_distribution.block)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Desafío</p>
              <p className="text-2xl font-bold text-yellow-500">{formatNumber(metrics.actions_distribution.challenge)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Fricción</p>
              <p className="text-2xl font-bold text-orange-500">{formatNumber(metrics.actions_distribution.friction)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
