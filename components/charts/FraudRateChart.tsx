'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FraudRateData } from '@/types';

interface FraudRateChartProps {
  data: FraudRateData[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  height?: number;
}

const FraudRateChart: React.FC<FraudRateChartProps> = ({
  data,
  isLoading = false,
  title = "Fraud Rate Trend",
  description = "Fraud detection rate over time",
  height = 300,
}) => {
  // Transform data for chart
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
    fraudRatePercent: Math.round(item.fraudRate * 100) / 100, // Round to 2 decimals
  }));

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'fraudRatePercent') {
      return [`${value}%`, 'Fraud Rate'];
    }
    if (name === 'transactions') {
      return [value.toLocaleString(), 'Total Transactions'];
    }
    if (name === 'fraudCount') {
      return [value.toLocaleString(), 'Fraud Cases'];
    }
    return [value, name];
  };

  const formatYAxisTick = (value: number) => `${value}%`;

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
            <p className="text-gray-600 font-medium">No data available</p>
            <p className="text-gray-500 text-sm">Data will appear here once transactions are processed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-3 w-3 bg-red-500 rounded-full"></div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickFormatter={formatYAxisTick}
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 'dataMax + 1']}
            />
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
            <Line
              type="monotone"
              dataKey="fraudRatePercent"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
              name="Fraud Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.transactions, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {chartData.reduce((sum, item) => sum + item.fraudCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Fraud Cases</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {chartData.length > 0 ? (
                (chartData.reduce((sum, item) => sum + item.fraudRate, 0) / chartData.length).toFixed(2)
              ) : 0}%
            </div>
            <div className="text-sm text-gray-600">Avg Fraud Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FraudRateChart;