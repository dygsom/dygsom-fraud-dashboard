'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartDataPoint } from '@/types';

interface VolumeChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  height?: number;
  showAmount?: boolean;
}

const VolumeChart: React.FC<VolumeChartProps> = ({
  data,
  isLoading = false,
  title = "Transaction Volume",
  description = "Daily transaction volume and amounts",
  height = 300,
  showAmount = true,
}) => {
  // Transform data for chart
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
    volume: item.value,
    amount: item.label ? parseFloat(item.label) : 0,
  }));

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'volume') {
      return [value.toLocaleString(), 'Transactions'];
    }
    if (name === 'amount') {
      return [`$${value.toLocaleString()}`, 'Total Amount'];
    }
    return [value, name];
  };

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="flex items-center justify-center animate-pulse bg-gray-100 rounded"
            style={{ height: `${height}px` }}
          >
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="flex flex-col items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-200"
            style={{ height: `${height}px` }}
          >
            <svg 
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
            <p className="text-gray-600 font-medium">No volume data available</p>
            <p className="text-gray-500 text-sm">Transaction volume will appear here once data is processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="left"
              tickFormatter={formatYAxisTick}
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            {showAmount && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `$${formatYAxisTick(value)}`}
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#374151', fontWeight: '500' }}
              formatter={formatTooltipValue}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="volume"
              fill="#3b82f6"
              name="Transaction Count"
              radius={[2, 2, 0, 0]}
            />
            {showAmount && (
              <Bar
                yAxisId="right"
                dataKey="amount"
                fill="#10b981"
                name="Total Amount ($)"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
        
        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.reduce((sum, item) => sum + item.volume, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
          {showAmount && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </div>
          )}
          {!showAmount && (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.volume, 0) / chartData.length) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Daily Volume</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VolumeChart;