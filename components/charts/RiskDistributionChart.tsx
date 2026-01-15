/**
 * RiskDistributionChart Component
 *
 * Pie chart showing risk level distribution.
 * Uses Recharts library for rendering.
 *
 * @module components/charts/RiskDistributionChart
 */

'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RiskDistribution } from '@/types/dashboard';

interface RiskDistributionChartProps {
  data: RiskDistribution;
}

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = [
    { name: 'Low Risk', value: data.low, color: COLORS.low },
    { name: 'Medium Risk', value: data.medium, color: COLORS.medium },
    { name: 'High Risk', value: data.high, color: COLORS.high },
    { name: 'Critical Risk', value: data.critical, color: COLORS.critical },
  ].filter((item) => item.value > 0); // Only show non-zero values

  const total = data.low + data.medium + data.high + data.critical;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) => {
            const percent = entry.percent ?? 0;
            return `${entry.name}: ${(percent * 100).toFixed(1)}%`;
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          labelStyle={{ color: '#cbd5e1' }}
          formatter={(value: any, name: any) => {
            const numValue = Number(value ?? 0);
            const percentage = ((numValue / total) * 100).toFixed(1);
            return [`${numValue} (${percentage}%)`, name ?? ''];
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
