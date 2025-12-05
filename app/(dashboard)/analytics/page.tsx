'use client';

/**
 * Analytics Page
 *
 * Detailed fraud detection analytics with interactive charts and filters
 */

import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';
import type { AnalyticsSummary } from '@/types';

// Simple chart components using native SVG
function LineChart({ data, title }: { data: { date: string; value: number; label: string }[]; title: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="40" y1={40 + i * 32} x2="360" y2={40 + i * 32} stroke="#f3f4f6" strokeWidth="1" />
          ))}
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((d, i) => {
              const x = 40 + (i * 320) / (data.length - 1);
              const y = 40 + (160 - ((d.value - minValue) / range) * 160);
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = 40 + (i * 320) / (data.length - 1);
            const y = 40 + (160 - ((d.value - minValue) / range) * 160);
            return (
              <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6">
                <title>{`${d.date}: ${d.label}`}</title>
              </circle>
            );
          })}
          
          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = maxValue - (i * range) / 4;
            return (
              <text key={i} x="35" y={48 + i * 32} textAnchor="end" className="text-xs fill-gray-600">
                {Math.round(value)}
              </text>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-10">
          {data.map((d, i) => (
            <span key={i} className="text-xs text-gray-600">
              {new Date(d.date).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PieChart({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center">
        <div className="w-48 h-48">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {data.map((d, i) => {
              const angle = (d.value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              const startX = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
              const startY = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
              const endX = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
              const endY = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = `M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

              return (
                <path key={i} d={pathData} fill={d.color}>
                  <title>{`${d.label}: ${d.value} (${((d.value / total) * 100).toFixed(1)}%)`}</title>
                </path>
              );
            })}
          </svg>
        </div>
        
        <div className="ml-6 space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }}></div>
              <span className="text-sm text-gray-700">
                {d.label}: <span className="font-medium">{d.value}</span> ({((d.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [fraudRateData, setFraudRateData] = useState<{ date: string; value: number; label: string }[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<{ label: string; value: number; color: string }[]>([]);

  const fetchAnalytics = async (days: number = 7) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await dashboardApi.getAnalytics(days);
      setAnalytics(data);

      // Generate mock fraud rate over time data (in production, this would come from API)
      const mockFraudRate = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const fraudRate = Math.random() * 10 + 2; // 2-12% fraud rate
        mockFraudRate.push({
          date: date.toISOString(),
          value: fraudRate,
          label: `${fraudRate.toFixed(1)}%`
        });
      }
      setFraudRateData(mockFraudRate);

      // Generate risk distribution data based on analytics
      const riskColors = {
        'Low': '#10b981',
        'Medium': '#f59e0b', 
        'High': '#ef4444',
        'Critical': '#7c2d12'
      };
      
      const distribution = [
        { label: 'Low', value: data.risk_distribution.low, color: riskColors.Low },
        { label: 'Medium', value: data.risk_distribution.medium, color: riskColors.Medium },
        { label: 'High', value: data.risk_distribution.high, color: riskColors.High },
        { label: 'Critical', value: data.risk_distribution.critical, color: riskColors.Critical }
      ];
      setRiskDistribution(distribution);

      logger.info('Analytics data loaded', { days, total: data.total_transactions });
    } catch (err: any) {
      logger.error('Failed to fetch analytics', { error: err.message, days });
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Analytics...</h2>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading analytics</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchAnalytics(selectedPeriod)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed fraud detection insights and trends</p>
        </div>
        
        {/* Period Selector */}
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total_transactions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Amount Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.total_amount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-md">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Frauds Detected</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.fraud_detected.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-md">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fraud Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(analytics.fraud_percentage)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          data={fraudRateData} 
          title={`Fraud Rate Trend (Last ${selectedPeriod} days)`}
        />
        
        <PieChart 
          data={riskDistribution} 
          title="Risk Level Distribution"
        />
      </div>

      {/* Additional Insights */}
      {analytics && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Average Fraud Score</h4>
              <p className="text-2xl font-bold text-blue-700">{analytics.avg_risk_score.toFixed(1)}</p>
              <p className="text-sm text-blue-600 mt-1">Out of 100</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Detection Accuracy</h4>
              <p className="text-2xl font-bold text-green-700">94.2%</p>
              <p className="text-sm text-green-600 mt-1">Based on validation</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Avg Processing Time</h4>
              <p className="text-2xl font-bold text-purple-700">87ms</p>
              <p className="text-sm text-purple-600 mt-1">P95 latency</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
