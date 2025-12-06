import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectOption } from '@/components/ui/select';
import { TransactionFilters } from '@/types/dashboard';


interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
}

const RISK_LEVELS: SelectOption[] = [
  { value: '', label: 'Any risk level' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const FRAUD_STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'Any status' },
  { value: 'true', label: 'Fraudulent' },
  { value: 'false', label: 'Legitimate' },
];

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFiltersCount = Object.values(filters).filter(
    value => value !== undefined && value !== ''
  ).length;

  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key: keyof TransactionFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Filter Icon */}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {isOpen && (
          <CardContent className="pt-4 space-y-4">
            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Active Filters:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-7 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.risk_level && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 border">
                      Risk: {filters.risk_level}
                      <button
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => removeFilter('risk_level')}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filters.is_fraud !== undefined && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 border">
                      Fraud: {filters.is_fraud ? 'Yes' : 'No'}
                      <button
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => removeFilter('is_fraud')}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {(filters.date_from || filters.date_to) && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 border">
                      Date Range
                      <button
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          removeFilter('date_from');
                          removeFilter('date_to');
                        }}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {(filters.min_amount || filters.max_amount) && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 border">
                      Amount Range
                      <button
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          removeFilter('min_amount');
                          removeFilter('max_amount');
                        }}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Risk Level Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Risk Level</label>
                <Select 
                  options={RISK_LEVELS}
                  value={filters.risk_level || ''} 
                  onValueChange={(value) => updateFilter('risk_level', value === '' ? undefined : value as any)}
                />
              </div>

              {/* Fraud Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fraud Status</label>
                <Select 
                  options={FRAUD_STATUS_OPTIONS}
                  value={filters.is_fraud === undefined ? '' : filters.is_fraud.toString()} 
                  onValueChange={(value) => {
                    if (value === '') {
                      removeFilter('is_fraud');
                    } else {
                      updateFilter('is_fraud', value === 'true');
                    }
                  }}
                />
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Amount Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min amount"
                  value={filters.min_amount || ''}
                  onChange={(e) => updateFilter('min_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <Input
                  type="number"
                  placeholder="Max amount"
                  value={filters.max_amount || ''}
                  onChange={(e) => updateFilter('max_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>
          </CardContent>
        )}
      </CardHeader>
    </Card>
  );
}