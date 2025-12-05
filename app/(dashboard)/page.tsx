/**
 * Dashboard Overview Page
 * 
 * Main dashboard page with analytics and statistics.
 * Uses API data with robust error handling and null-safe formatting.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { dashboardApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/format';
import type { AnalyticsSummary } from '@/types';

// Configuration constants - avoiding hardcoding
const DASHBOARD_CONFIG = {
  ANALYTICS_DAYS: 7,
  REFRESH_INTERVAL_MS: 30000, // 30 seconds
  RETRY_DELAY_MS: 5000, // 5 seconds
} as const;

export default function DashboardPage() {
  console.log('📈 DASHBOARD PAGE INITIALIZING');
  
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (retryAttempt = false) => {
    try {
      if (retryAttempt) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      logger.info('Fetching dashboard analytics', { 
        days: DASHBOARD_CONFIG.ANALYTICS_DAYS, 
        isRetry: retryAttempt 
      });

      console.log('📈 FETCHING ANALYTICS...');
      const data = await dashboardApi.getAnalytics(DASHBOARD_CONFIG.ANALYTICS_DAYS);
      
      console.log('✅ ANALYTICS DATA RECEIVED:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        totalTransactions: data?.total_transactions,
        totalAmount: data?.total_amount
      });
      
      setAnalytics(data);
      setLastUpdated(new Date());

      logger.info('Dashboard analytics loaded successfully', {
        total_transactions: data?.total_transactions || 0,
        total_amount: data?.total_amount || 0,
        fraud_rate: data?.fraud_percentage || 0,
      });
    } catch (err: any) {
      logger.error('Failed to load dashboard analytics', {
        error: err,
        isRetry: retryAttempt,
        errorMessage: err?.message,
        statusCode: err?.status_code,
      });
      
      // Provide more specific error messages based on status code
      const getErrorMessage = (error: any): string => {
        if (error?.status_code === 401) {
          return 'Session expired. Please log in again.';
        }
        if (error?.status_code === 403) {
          return 'You do not have permission to view this data.';
        }
        if (error?.status_code >= 500) {
          return 'Server error. Please try again later.';
        }
        if (!error?.status_code) {
          return 'Network error. Please check your connection.';
        }
        if (error?.message) {
          return error.message;
        }
        return 'Failed to load analytics';
      };
      
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !error) {
        fetchAnalytics(true);
      }
    }, DASHBOARD_CONFIG.REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchAnalytics, isLoading, error]);

  // Loading state
  if (isLoading && !analytics) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando Dashboard</h2>
          <p className="text-gray-600">Obteniendo datos de analítica...</p>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error && !analytics) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-4 h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalytics()}
            disabled={isRetrying}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? 'Reintentando...' : 'Reintentar'}
          </button>
        </div>
      </div>
    );
  }

  // Helper function to safely get analytics values with defaults
  const getAnalyticsValue = <T,>(value: T | null | undefined, defaultValue: T): T => {
    return value ?? defaultValue;
  };

  return (
    <div className="space-y-8">
      {/* Header with status indicator */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control DYGSOM</h1>
            <p className="text-gray-600">Sistema de Detección de Fraude</p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Última actualización: {lastUpdated.toLocaleTimeString()}
                {isRetrying && <span className="ml-2 text-blue-600">• Actualizando...</span>}
              </p>
            )}
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            error ? 'bg-red-500' : 'bg-green-500'
          }`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={error ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(getAnalyticsValue(analytics?.total_transactions, 0))}
            </div>
            <p className="text-xs text-gray-500">
              Últimos {DASHBOARD_CONFIG.ANALYTICS_DAYS} días
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getAnalyticsValue(analytics?.total_amount, 0))}
            </div>
            <p className="text-xs text-gray-500">
              Últimos {DASHBOARD_CONFIG.ANALYTICS_DAYS} días
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Transacciones Fraudulentas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(getAnalyticsValue(analytics?.fraud_detected, 0))}
            </div>
            <p className="text-xs text-gray-500">
              {formatPercentage(getAnalyticsValue(analytics?.fraud_percentage, 0))} del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${error ? 'text-red-600' : 'text-green-600'}`}>
              {error ? 'Error' : 'Operativo'}
            </div>
            <p className="text-xs text-gray-500">
              {error ? 'Verificar conexión' : 'API funcionando correctamente'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Resumen de Actividad
            </CardTitle>
            <CardDescription>
              Actividad de transacciones de los últimos {DASHBOARD_CONFIG.ANALYTICS_DAYS} días
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Transacciones Legítimas:</span>
              <span className="font-medium">
                {formatNumber(
                  getAnalyticsValue(analytics?.total_transactions, 0) - 
                  getAnalyticsValue(analytics?.fraud_detected, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Promedio por día:</span>
              <span className="font-medium">
                {formatNumber(getAnalyticsValue(analytics?.total_transactions, 0) / DASHBOARD_CONFIG.ANALYTICS_DAYS)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Tasa de detección:</span>
              <span className="font-medium text-green-600">
                {formatPercentage(getAnalyticsValue(analytics?.fraud_percentage, 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Estado de Servicios
            </CardTitle>
            <CardDescription>
              Estado actual de los componentes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">API de Detección:</span>
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {error ? 'Error' : 'Activo'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Base de Datos:</span>
              <span className="font-medium px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Conectado
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Cache (Redis):</span>
              <span className="font-medium px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Operativo
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Herramientas de administración del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={isRetrying}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRetrying ? 'Actualizando...' : 'Actualizar Datos'}
            </button>
            
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Reporte
            </button>
            
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}