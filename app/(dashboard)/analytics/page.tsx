'use client';

/**
 * Analytics Page - DYGSOM Dashboard
 *
 * Página de analytics con tendencias de fraude, volumen y distribución de riesgo.
 * Usa hook useAnalytics para obtener datos del backend con SWR.
 *
 * @module app/(dashboard)/analytics
 */

import { useState } from 'react';
import { RefreshCw, Download, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useAnalytics } from '@/lib/hooks';
import { api } from '@/lib/api/client';
import { FraudRateTrendChart, VolumeTrendChart, RiskDistributionChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  const analytics = useAnalytics();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const handleRefresh = () => {
    analytics.fraudRate.mutate();
    analytics.volume.mutate();
    analytics.riskDistribution.mutate();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    setExportFormat(format);
    
    try {
      const response = await api.analytics.export({ format });
      
      // Create download link
      const blob = new Blob([response as unknown as string], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Error logged to browser console for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Export error:', error);
      }
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-400">Fraud detection trends and insights</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={analytics.isLoading}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${analytics.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            size="sm"
            disabled={isExporting || analytics.isLoading}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting && exportFormat === 'csv' ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            size="sm"
            disabled={isExporting || analytics.isLoading}
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting && exportFormat === 'json' ? 'Exporting...' : 'Export JSON'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {analytics.isError && (
        <Card className="mb-6 border-red-900 bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-400">Error loading analytics data. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {analytics.isLoading && (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-slate-400">Loading analytics...</p>
          </div>
        </div>
      )}

      {/* Analytics Grid */}
      {!analytics.isLoading && !analytics.isError && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Fraud Rate Trend */}
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Fraud Rate Trend</CardTitle>
                  <CardDescription className="text-slate-400">
                    Fraud detection rate over time
                  </CardDescription>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analytics.fraudRate.trend && analytics.fraudRate.trend.length > 0 ? (
                <FraudRateTrendChart data={analytics.fraudRate.trend} />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700">
                  <p className="text-sm text-slate-500">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Volume Trend */}
          <Card className="border-slate-800 bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Volume Trend</CardTitle>
                  <CardDescription className="text-slate-400">
                    Detection requests over time
                  </CardDescription>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3">
                  <BarChart3 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analytics.volume.trend && analytics.volume.trend.length > 0 ? (
                <VolumeTrendChart data={analytics.volume.trend} />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700">
                  <p className="text-sm text-slate-500">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="border-slate-800 bg-slate-900 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Risk Distribution</CardTitle>
                  <CardDescription className="text-slate-400">
                    Distribution of risk levels across all detections
                  </CardDescription>
                </div>
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <PieChart className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Risk Distribution Summary */}
              {analytics.riskDistribution.distribution && (
                <div className="mb-6 grid grid-cols-4 gap-4">
                  <div className="rounded-lg border border-green-900 bg-green-950/20 p-4">
                    <p className="text-xs font-medium text-green-400">Low Risk</p>
                    <p className="mt-2 text-2xl font-bold text-white">{analytics.riskDistribution.distribution.low}</p>
                  </div>
                  <div className="rounded-lg border border-yellow-900 bg-yellow-950/20 p-4">
                    <p className="text-xs font-medium text-yellow-400">Medium Risk</p>
                    <p className="mt-2 text-2xl font-bold text-white">{analytics.riskDistribution.distribution.medium}</p>
                  </div>
                  <div className="rounded-lg border border-orange-900 bg-orange-950/20 p-4">
                    <p className="text-xs font-medium text-orange-400">High Risk</p>
                    <p className="mt-2 text-2xl font-bold text-white">{analytics.riskDistribution.distribution.high}</p>
                  </div>
                  <div className="rounded-lg border border-red-900 bg-red-950/20 p-4">
                    <p className="text-xs font-medium text-red-400">Critical Risk</p>
                    <p className="mt-2 text-2xl font-bold text-white">{analytics.riskDistribution.distribution.critical}</p>
                  </div>
                </div>
              )}

              {/* Risk Distribution Chart */}
              {analytics.riskDistribution.distribution ? (
                <RiskDistributionChart data={analytics.riskDistribution.distribution} />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-700">
                  <p className="text-sm text-slate-500">No data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
