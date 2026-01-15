/**
 * VolumeTrendChart Component
 *
 * Bar chart showing request volume trends over time.
 * Uses Recharts library for rendering.
 *
 * @module components/charts/VolumeTrendChart
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { VolumeTrend } from '@/types/dashboard';

interface VolumeTrendChartProps {
  data: VolumeTrend[];
}

export function VolumeTrendChart({ data }: VolumeTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-400">No data available</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    requests: item.request_count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
          label={{ value: 'Requests', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          labelStyle={{ color: '#cbd5e1' }}
          formatter={(value: any) => {
            return [Number(value ?? 0), 'Requests'];
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="rect"
        />
        <Bar 
          dataKey="requests" 
          fill="#3b82f6" 
          name="Total Requests"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
