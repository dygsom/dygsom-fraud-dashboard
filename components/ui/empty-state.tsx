import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Empty State Components
 * 
 * Reusable empty state components for when there's no data to display
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  className, 
  size = 'md' 
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className={cn(
          "flex items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4",
          iconSizes[size]
        )}>
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            action.variant === 'secondary' 
              ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Predefined empty states for common scenarios
const NoTransactions = ({ onCreateFirst }: { onCreateFirst?: () => void }) => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
    title="No transactions yet"
    description="When you start processing fraud detection requests, your transactions will appear here."
    action={onCreateFirst ? {
      label: "View Documentation",
      onClick: onCreateFirst,
      variant: 'primary'
    } : undefined}
  />
);

const NoAPIKeys = ({ onCreate }: { onCreate?: () => void }) => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    }
    title="No API keys found"
    description="Create your first API key to start integrating DYGSOM fraud detection into your applications."
    action={onCreate ? {
      label: "Create API Key",
      onClick: onCreate,
      variant: 'primary'
    } : undefined}
  />
);

const NoAnalyticsData = ({ onRefresh }: { onRefresh?: () => void }) => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
      </svg>
    }
    title="No analytics data available"
    description="Analytics will be generated once you start processing fraud detection requests through the API."
    action={onRefresh ? {
      label: "Refresh",
      onClick: onRefresh,
      variant: 'secondary'
    } : undefined}
  />
);

const SearchNoResults = ({ searchQuery, onClear }: { searchQuery?: string; onClear?: () => void }) => (
  <EmptyState
    size="sm"
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No results found"
    description={searchQuery ? `No results found for "${searchQuery}". Try adjusting your search terms.` : "No results found. Try adjusting your search terms."}
    action={onClear ? {
      label: "Clear search",
      onClick: onClear,
      variant: 'secondary'
    } : undefined}
  />
);

const ErrorState = ({ onRetry, title = "Something went wrong", description }: { 
  onRetry?: () => void; 
  title?: string;
  description?: string;
}) => (
  <EmptyState
    icon={
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title={title}
    description={description || "We encountered an error while loading the data. Please try again."}
    action={onRetry ? {
      label: "Try again",
      onClick: onRetry,
      variant: 'primary'
    } : undefined}
  />
);

export {
  EmptyState,
  NoTransactions,
  NoAPIKeys,
  NoAnalyticsData,
  SearchNoResults,
  ErrorState,
};