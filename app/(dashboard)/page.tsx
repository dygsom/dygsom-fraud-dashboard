'use client';

/**
 * Dashboard Overview Page
 *
 * Main dashboard page with analytics and statistics
 */

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NetworkErrorDisplay, LoadingState, EmptyState } from '@/components/ui/error-display';
import { dashboardApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/format';
import type { AnalyticsSummary } from '@/types';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchAnalytics = useCallback(async (retryAttempt = false) => {
    try {
      if (retryAttempt) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      logger.info('Fetching dashboard analytics', { days: 7, isRetry: retryAttempt });

      const data = await dashboardApi.getAnalytics(7);
      setAnalytics(data);

      logger.info('Dashboard analytics loaded successfully', {
        total_transactions: data.total_transactions,
        total_amount: data.total_amount,
        fraud_rate: data.fraud_percentage,
      });
    } catch (err: any) {
      logger.error('Failed to load dashboard analytics', {
        error: err,
        isRetry: retryAttempt,
        errorMessage: err?.message,
        statusCode: err?.status_code,
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load analytics';
      if (err?.status_code === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err?.status_code === 403) {
        errorMessage = 'You do not have permission to view this data.';
      } else if (err?.status_code >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!err?.status_code) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="dygsom-card dygsom-card-hover p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dygsom-text-primary mb-2">Panel de Control</h1>
            <p className="text-slate-600">Cargando datos de analítica de fraude...</p>
          </div>
          <div className="w-16 h-16 dygsom-gradient-primary rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      <LoadingState message="Obteniendo datos de analítica..." />
    </div>
  );
}  if (error) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="dygsom-card dygsom-card-hover p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold dygsom-text-primary mb-2">Panel de Control</h1>
              <p className="text-slate-600">Error al cargar los datos de analítica</p>
            </div>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
        <NetworkErrorDisplay 
          error={error} 
          onRetry={() => fetchAnalytics(true)}
          isRetrying={isRetrying}
          showDetails={true}
        />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">No data available</p>
        </div>
        <EmptyState 
          title="No Analytics Data Available"
          description="There's no analytics data to display at the moment."
          action={{
            label: "Refresh Data",
            onClick: () => fetchAnalytics(true)
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="dygsom-card dygsom-card-hover p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dygsom-text-primary mb-2">Panel de Control</h1>
            <p className="text-slate-600">Análisis de los últimos 7 días • Sistema DYGSOM</p>
          </div>
          <div className="w-16 h-16 dygsom-gradient-primary rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">"
        <Card className="dygsom-card dygsom-card-hover border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Total de Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold dygsom-text-primary mb-1">
              {formatNumber(analytics.total_transactions)}
            </div>
            <div className="text-xs text-slate-500">Procesadas en el período</div>
          </CardContent>
        </Card>

        <Card className="dygsom-card dygsom-card-hover border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Monto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {formatCurrency(analytics.total_amount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Fraud Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(analytics.fraud_detected)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(analytics.fraud_percentage / 100)} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avg_risk_score.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">out of 100</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>Transactions by risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm font-medium text-green-800">Low Risk</div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                {formatNumber(analytics.risk_distribution.low)}
              </div>
            </div>

            <div className="rounded-md bg-yellow-50 p-4">
              <div className="text-sm font-medium text-yellow-800">Medium Risk</div>
              <div className="text-2xl font-bold text-yellow-900 mt-2">
                {formatNumber(analytics.risk_distribution.medium)}
              </div>
            </div>

            <div className="rounded-md bg-orange-50 p-4">
              <div className="text-sm font-medium text-orange-800">High Risk</div>
              <div className="text-2xl font-bold text-orange-900 mt-2">
                {formatNumber(analytics.risk_distribution.high)}
              </div>
            </div>

            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm font-medium text-red-800">Critical Risk</div>
              <div className="text-2xl font-bold text-red-900 mt-2">
                {formatNumber(analytics.risk_distribution.critical)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fraud by Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud by Payment Method</CardTitle>
          <CardDescription>Fraud rate across different payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.fraud_by_payment_method.map((method) => (
              <div key={method.payment_method} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {method.payment_method}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatNumber(method.total_transactions)} transactions
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(method.fraud_count)} fraud
                  </div>
                  <div className="text-xs text-red-600">
                    {formatPercentage(method.fraud_rate)} rate
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
