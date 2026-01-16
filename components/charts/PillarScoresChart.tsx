/**
 * PillarScoresChart Component
 *
 * Bar chart visualization showing scores for all 4 fraud detection pillars.
 * Color-coded bars based on risk level.
 *
 * @module components/charts
 * @see {@link ../../types/dashboard.ts} for PillarScores type
 */

'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { getRiskScoreColor } from '@/lib/utils/format';

// ============================================
// TYPES
// ============================================

interface PillarScores {
  bot_detection?: number;
  account_takeover?: number;
  api_security?: number;
  fraud_ml?: number;
}

interface PillarScoresChartProps {
  /**
   * Pillar scores (0.0 - 1.0)
   */
  scores: PillarScores;

  /**
   * Optional CSS classes
   */
  className?: string;
}

interface ChartData {
  name: string;
  score: number;
  color: string;
}

// ============================================
// CONSTANTS
// ============================================

const PILLAR_LABELS = {
  bot_detection: 'Bot Detection',
  account_takeover: 'Account Takeover',
  api_security: 'API Security',
  fraud_ml: 'Fraud ML',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform pillar scores to chart data
 * Handles null scores (disabled pillars)
 */
function transformToChartData(scores: PillarScores): ChartData[] {
  return Object.entries(PILLAR_LABELS).map(([key, label]) => {
    const score = scores[key as keyof PillarScores];
    // If score is null/undefined, pillar is disabled
    if (score === null || score === undefined) {
      return {
        name: label,
        score: 0,
        color: '#475569', // slate-600 for disabled
      };
    }
    return {
      name: label,
      score: score * 100, // Convert to percentage
      color: getRiskScoreColor(score),
    };
  });
}

// ============================================
// COMPONENT
// ============================================

export function PillarScoresChart({ scores, className = '' }: PillarScoresChartProps) {
  // Transform data
  const chartData = useMemo(() => transformToChartData(scores), [scores]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as ChartData;
    const isDisabled = data.score === 0 && data.color === '#475569';
    
    return (
      <div className="bg-slate-900 border border-slate-700 rounded p-3 shadow-lg">
        <p className="text-white font-medium">{data.name}</p>
        <p className="text-lg font-bold" style={{ color: data.color }}>
          {isDisabled ? 'Disabled' : `${data.score.toFixed(1)}%`}
        </p>
      </div>
    );
  };

  return (
    <div className={`p-6 bg-slate-800/50 rounded-lg border border-slate-700 ${className}`}>
      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-4">Pillar Scores</h3>
      
      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="name"
            angle={-15}
            textAnchor="end"
            height={80}
            tick={{ fill: '#e2e8f0', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#e2e8f0', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            label={{
              value: 'Score (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#e2e8f0', fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar dataKey="score" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Bajo (&lt;40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Medio (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>Alto (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Crítico (≥80%)</span>
        </div>
      </div>
    </div>
  );
}
