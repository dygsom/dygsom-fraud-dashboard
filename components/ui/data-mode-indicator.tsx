'use client';

/**
 * Data Mode Indicator - Simplified
 *
 * Shows tenant information (no test/production mode with API Keys)
 */

import { useAuth } from '@/context/AuthContext';

export function DataModeIndicator() {
  const { tenant } = useAuth();

  if (!tenant) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded">
      <div className="w-2 h-2 bg-blue-600 rounded-full" />
      <span className="text-xs font-medium text-blue-900">
        {tenant.tenant_name}
      </span>
    </div>
  );
}
