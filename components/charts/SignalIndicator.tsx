/**
 * SignalIndicator Component
 *
 * Individual signal status indicator with icon and label.
 * Shows boolean signals (true/false) with color-coded visual feedback.
 *
 * @module components/charts
 */

'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface SignalIndicatorProps {
  /**
   * Signal label (e.g., "Device Known", "IP Suspicious")
   */
  label: string;

  /**
   * Signal value (boolean or number)
   */
  value: boolean | number;

  /**
   * Whether true is risky (default: false)
   * If true: true=red, false=green
   * If false: true=green, false=red
   */
  trueIsRisky?: boolean;

  /**
   * Optional CSS classes
   */
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function SignalIndicator({
  label,
  value,
  trueIsRisky = false,
  className = '',
}: SignalIndicatorProps) {
  // Determine if signal indicates risk
  const isRisky = typeof value === 'boolean' 
    ? (trueIsRisky ? value : !value)
    : value > 0.5;

  // Icon and color based on risk
  const Icon = isRisky ? XCircle : CheckCircle2;
  const iconColor = isRisky ? 'text-red-500' : 'text-green-500';
  const bgColor = isRisky ? 'bg-red-500/10' : 'bg-green-500/10';
  const borderColor = isRisky ? 'border-red-500/30' : 'border-green-500/30';

  // Format value display
  const displayValue = typeof value === 'boolean'
    ? value ? 'Sí' : 'No'
    : `${Math.round(value * 100)}%`;

  return (
    <div
      className={`flex items-center justify-between p-2 rounded border ${bgColor} ${borderColor} ${className}`}
    >
      {/* Label */}
      <div className="flex items-center gap-2 flex-1">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-sm text-slate-300">{label}</span>
      </div>

      {/* Value */}
      <span className={`text-sm font-medium ${iconColor}`}>
        {displayValue}
      </span>
    </div>
  );
}
