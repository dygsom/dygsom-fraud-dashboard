/**
 * MetricCard Component
 *
 * Reusable card component for displaying key metrics on the dashboard.
 * Follows the DRY principle to eliminate duplication in dashboard layout.
 *
 * @component
 * @example
 * ```tsx
 * <MetricCard
 *   title="Total Detections"
 *   value="1,234"
 *   subtitle="+12% vs yesterday"
 *   valueColor="text-primary"
 *   icon={<Activity className="h-4 w-4" />}
 * />
 * ```
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export interface MetricCardProps {
  /** Main title of the metric */
  title: string;
  /** Value to display (formatted as string for flexibility) */
  value: string | number;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Tailwind color class for the value */
  valueColor?: string;
  /** Optional icon to display in the header */
  icon?: React.ReactNode;
  /** Optional className for additional styling */
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  valueColor = 'text-foreground',
  icon,
  className = '',
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
