/**
 * RiskScoreGauge Component
 *
 * Circular gauge visualization for fraud detection risk scores.
 * Displays score as percentage with color-coded severity levels.
 *
 * @module components/charts
 * @see {@link ../../types/dashboard.ts} for ActionType enum
 */

'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getRiskScoreColor } from '@/lib/utils/format';
import type { ActionType } from '@/types/dashboard';

// ============================================
// TYPES
// ============================================

interface RiskScoreGaugeProps {
  /**
   * Risk score value (0.0 - 1.0)
   */
  score: number;

  /**
   * Action type from fraud detection
   */
  action: ActionType;

  /**
   * Optional CSS classes
   */
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const SCORE_COLORS = {
  critical: '#ef4444', // Red - score >= 0.8
  high: '#f97316',     // Orange - score >= 0.6
  medium: '#eab308',   // Yellow - score >= 0.4
  low: '#10b981',      // Green - score < 0.4
  background: '#1e293b', // Dark gray
} as const;

const ACTION_LABELS = {
  allow: 'PERMITIDO',
  block: 'BLOQUEADO',
  challenge: 'DESAFÍO',
  friction: 'FRICCIÓN',
} as const;

// ============================================
// COMPONENT
// ============================================

export function RiskScoreGauge({ score, action, className = '' }: RiskScoreGaugeProps) {
  // Validate score range
  if (score < 0 || score > 1) {
    console.error(`Invalid risk score: ${score}. Must be between 0 and 1.`);
    return null;
  }

  // Memoized calculations
  const percentage = useMemo(() => Math.round(score * 100), [score]);
  const color = useMemo(() => getRiskScoreColor(score), [score]);
  const actionLabel = ACTION_LABELS[action] || action.toUpperCase();

  // Gauge data (filled vs empty)
  const data = useMemo(
    () => [
      { name: 'Score', value: percentage },
      { name: 'Empty', value: 100 - percentage },
    ],
    [percentage]
  );

  return (
    <div className={`flex flex-col items-center p-6 bg-slate-800/50 rounded-lg border border-slate-700 ${className}`}>
      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-4">Risk Score</h3>

      {/* Gauge Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill={SCORE_COLORS.background} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Score Display */}
      <div className="mt-2 text-center">
        <p 
          className="text-4xl font-bold" 
          style={{ color }}
        >
          {percentage}%
        </p>
        <p className="text-sm text-slate-400 mt-1 uppercase tracking-wide">
          {actionLabel}
        </p>
      </div>

      {/* Risk Level Indicator */}
      <div className="mt-4 w-full">
        <div className="flex justify-between text-xs text-slate-200 mb-1">
          <span>Bajo</span>
          <span>Medio</span>
          <span>Alto</span>
          <span>Crítico</span>
        </div>
        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden flex">
          <div className="w-1/4 bg-green-500" />
          <div className="w-1/4 bg-yellow-500" />
          <div className="w-1/4 bg-orange-500" />
          <div className="w-1/4 bg-red-500" />
        </div>
        <div 
          className="mt-1 w-0.5 h-3 bg-white rounded-full transition-all duration-300"
          style={{ marginLeft: `calc(${percentage}% - 1px)` }}
        />
      </div>
    </div>
  );
}
