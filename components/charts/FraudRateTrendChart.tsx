/**
 * FraudRateTrendChart Component
 *
 * Line chart showing fraud detection rate trends over time.
 * Uses Recharts library for rendering.
 *
 * @module components/charts/FraudRateTrendChart
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FraudRateTrend } from '@/types/dashboard';

interface FraudRateTrendChartProps {
  data: FraudRateTrend[];
}

export function FraudRateTrendChart({ data }: FraudRateTrendChartProps) {
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
    fraudRate: (item.fraud_rate * 100).toFixed(2), // Convert to percentage
    totalRequests: item.total_requests,
    blockedRequests: item.blocked_requests,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
          label={{ value: 'Fraud Rate (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          labelStyle={{ color: '#cbd5e1' }}
          formatter={(value: any, name: any) => {
            if (name === 'fraudRate') return [`${value}%`, 'Fraud Rate'];
            if (name === 'totalRequests') return [Number(value), 'Total Requests'];
            if (name === 'blockedRequests') return [Number(value), 'Blocked'];
            return [value ?? '', name ?? ''];
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="fraudRate"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', r: 4 }}
          activeDot={{ r: 6 }}
          name="Fraud Rate (%)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
