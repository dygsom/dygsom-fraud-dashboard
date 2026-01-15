'use client';

/**
 * Transactions Page - Recent Fraud Detections
 *
 * View all fraud detection scores with filters and pagination.
 * Implements Fase 4 specifications from PASOS_DESARROLLO_DASHBOARD.md
 *
 * @module app/(dashboard)/transactions
 */

import { useState } from 'react';
import { useRecentScores } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime, getRiskScoreColor } from '@/lib/utils/format';
import { RefreshCw, Filter, X } from 'lucide-react';
import type { ScoreResponse, ActionType } from '@/types/dashboard';

export default function TransactionsPage() {
  const [action, setAction] = useState<ActionType | 'all'>('all');
  const [limit, setLimit] = useState(50);
  
  const { scores, isLoading, isError, mutate: refresh } = useRecentScores({ 
    limit,
    action: action === 'all' ? undefined : action
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-slate-400">Cargando detecciones...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <Card className="bg-red-900/10 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-400">Error al cargar las detecciones. Intente nuevamente.</p>
            <button 
              onClick={() => refresh()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Detecciones de Fraude</h1>
          <p className="text-slate-400 mt-1">
            {scores?.length ?? 0} detección(es) reciente(s)
          </p>
        </div>
        <button
          onClick={() => refresh()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Acción
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as ActionType | 'all')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="allow">Permitir</option>
                <option value="block">Bloquear</option>
                <option value="challenge">Desafío</option>
                <option value="friction">Fricción</option>
              </select>
            </div>

            {/* Limit Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mostrar
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={20}>20 registros</option>
                <option value={50}>50 registros</option>
                <option value={100}>100 registros</option>
                <option value={200}>200 registros</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setAction('all');
                  setLimit(50);
                }}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          {!scores || scores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No hay detecciones que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Pilares
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {scores.map((score: ScoreResponse, idx: number) => (
                    <tr key={score.request_id || idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-300">
                        {score.request_id?.slice(0, 12) || 'N/A'}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            score.action === 'block'
                              ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                              : score.action === 'allow'
                              ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                              : score.action === 'challenge'
                              ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                              : 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
                          }`}
                        >
                          {score.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${getRiskScoreColor(score.risk_score)}`}>
                            {(score.risk_score * 100).toFixed(1)}%
                          </span>
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                score.risk_score >= 0.8
                                  ? 'bg-red-500'
                                  : score.risk_score >= 0.6
                                  ? 'bg-orange-500'
                                  : score.risk_score >= 0.4
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${score.risk_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        <div className="flex flex-wrap gap-1">
                          {score.pillar_scores.bot_detection !== undefined && (
                            <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-500/30">
                              BOT: {(score.pillar_scores.bot_detection * 100).toFixed(0)}%
                            </span>
                          )}
                          {score.pillar_scores.account_takeover !== undefined && (
                            <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs border border-purple-500/30">
                              ATO: {(score.pillar_scores.account_takeover * 100).toFixed(0)}%
                            </span>
                          )}
                          {score.pillar_scores.api_security !== undefined && (
                            <span className="px-2 py-1 bg-orange-900/30 text-orange-400 rounded text-xs border border-orange-500/30">
                              API: {(score.pillar_scores.api_security * 100).toFixed(0)}%
                            </span>
                          )}
                          {score.pillar_scores.fraud_ml !== undefined && (
                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs border border-red-500/30">
                              ML: {(score.pillar_scores.fraud_ml * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDateTime(score.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
