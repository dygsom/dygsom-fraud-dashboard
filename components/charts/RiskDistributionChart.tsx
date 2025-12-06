'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RiskDistributionData } from '@/types';

interface RiskDistributionChartProps {
  data: RiskDistributionData[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  height?: number;
}

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  data,
  isLoading = false,
  title = "Risk Level Distribution",
  description = "Transaction distribution by risk levels",
  height = 350,
}) => {
  // Default colors for risk levels
  const defaultColors = {
    low: '#10b981',      // green-500
    medium: '#f59e0b',   // amber-500  
    high: '#f97316',     // orange-500
    critical: '#ef4444', // red-500
  };

  // Prepare chart data
  const chartData = data.map(item => ({
    ...item,
    fill: item.color || defaultColors[item.risk_level as keyof typeof defaultColors] || '#6b7280'
  }));

  const totalTransactions = data.reduce((sum, item) => sum + item.count, 0);

  const renderCustomizedLabel = (entry: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = entry;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percentage).toFixed(0)}%`}
      </text>
    );
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'count') {
      return [value.toLocaleString(), 'Transactions'];
    }
    if (name === 'percentage') {
      return [`${value.toFixed(1)}%`, 'Percentage'];
    }
    return [value, name];
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" 
              />
            </svg>
            <p className="text-gray-600 font-medium">No distribution data</p>
            <p className="text-gray-500 text-sm">Risk distribution will appear once transactions are analyzed</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={Math.min(height / 3, 120)}
                  fill="#8884d8"
                  dataKey="count"
                  stroke="white"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={formatTooltipValue}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and Stats */}
          <div className="flex flex-col justify-center">
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="font-medium capitalize text-gray-700">
                      {item.risk_level} Risk
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {item.count.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-lg text-gray-900">
                  {totalTransactions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskDistributionChart;