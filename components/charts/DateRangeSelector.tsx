'use client';

import React, { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { DateRangeOption, AnalyticsTimeframe } from '@/types';

interface DateRangeSelectorProps {
  value: AnalyticsTimeframe;
  onChange: (timeframe: AnalyticsTimeframe) => void;
  className?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(value.startDate);
  const [customEndDate, setCustomEndDate] = useState(value.endDate);

  const predefinedOptions: DateRangeOption[] = [
    { label: 'Last 7 days', value: '7d', days: 7 },
    { label: 'Last 30 days', value: '30d', days: 30 },
    { label: 'Last 90 days', value: '90d', days: 90 },
  ];

  const handlePredefinedChange = (option: DateRangeOption) => {
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, option.days - 1));

    onChange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      period: option.value as '7d' | '30d' | '90d' | 'custom',
    });

    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      onChange({
        startDate: customStartDate,
        endDate: customEndDate,
        period: 'custom',
      });
      setShowCustom(false);
    }
  };

  const handleCustomCancel = () => {
    setCustomStartDate(value.startDate);
    setCustomEndDate(value.endDate);
    setShowCustom(false);
  };

  const getCurrentLabel = () => {
    if (value.period !== 'custom') {
      return predefinedOptions.find(opt => opt.value === value.period)?.label || 'Select range';
    }
    return `${format(new Date(value.startDate), 'MMM dd')} - ${format(new Date(value.endDate), 'MMM dd, yyyy')}`;
  };

  return (
    <div className={`relative ${className}`}>
      <Card className="p-4">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Time Period</h3>
            <div className="text-xs text-gray-500">
              {getCurrentLabel()}
            </div>
          </div>

          {/* Predefined options */}
          <div className="flex flex-wrap gap-2 mb-4">
            {predefinedOptions.map((option) => (
              <Button
                key={option.value}
                variant={value.period === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePredefinedChange(option)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
            <Button
              variant={value.period === 'custom' && !showCustom ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowCustom(!showCustom)}
              className="text-xs"
            >
              Custom
            </Button>
          </div>

          {/* Custom date picker */}
          {showCustom && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    max={customEndDate}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={customStartDate}
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCustomApply}
                  disabled={!customStartDate || !customEndDate || customStartDate > customEndDate}
                  className="text-xs"
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCustomCancel}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.ceil((new Date(value.endDate).getTime() - new Date(value.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                </div>
                <div className="text-xs text-gray-600">Days Selected</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {value.period.toUpperCase()}
                </div>
                <div className="text-xs text-gray-600">Period Type</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DateRangeSelector;