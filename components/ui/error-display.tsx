'use client';

/**
 * Error Boundary and Error Display Components
 *
 * Provides robust error handling UI components with retry capabilities
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NetworkErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  showDetails?: boolean;
}

export function NetworkErrorDisplay({ 
  error, 
  onRetry, 
  isRetrying = false,
  showDetails = false 
}: NetworkErrorDisplayProps) {
  const [showFullError, setShowFullError] = useState(false);

  if (!error) return null;

  const isNetworkError = error.includes('Network') || error.includes('network') || error.includes('timeout');
  const isAuthError = error.includes('401') || error.includes('Unauthorized');

  return (
    <Card className="dygsom-card border-red-200 bg-red-50/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {isNetworkError ? (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : isAuthError ? (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-800">
              {isNetworkError 
                ? 'Network Connection Error'
                : isAuthError 
                  ? 'Authentication Required'
                  : 'An error occurred'
              }
            </h3>
            
            <div className="mt-1">
              <p className="text-sm text-red-700">
                {isNetworkError 
                  ? 'Unable to connect to the server. Please check your internet connection.'
                  : isAuthError
                    ? 'Your session may have expired. Please log in again.'
                    : 'Something went wrong while loading the data.'
                }
              </p>
              
              {showDetails && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowFullError(!showFullError)}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    {showFullError ? 'Hide details' : 'Show details'}
                  </button>
                  
                  {showFullError && (
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto max-h-32">
                      {error}
                    </pre>
                  )}
                </div>
              )}
            </div>
            
            {onRetry && !isAuthError && (
              <div className="mt-3 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  {isRetrying ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {isAuthError && (
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/login'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className = 'h-64' }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}