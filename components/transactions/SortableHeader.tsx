import React from 'react';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  field: string | null;
  direction: SortDirection;
}

interface SortableHeaderProps {
  field: string;
  children: React.ReactNode;
  sortState: SortState;
  onSort: (field: string) => void;
  className?: string;
}

export function SortableHeader({
  field,
  children,
  sortState,
  onSort,
  className
}: SortableHeaderProps) {
  const isActive = sortState.field === field;
  const direction = isActive ? sortState.direction : null;

  return (
    <th 
      className={cn(
        "pb-3 cursor-pointer select-none hover:bg-gray-50 transition-colors",
        className
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <svg 
            className={cn(
              "h-3 w-3 -mb-1 transition-colors",
              direction === 'asc' ? "text-blue-600" : "text-gray-300"
            )} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg 
            className={cn(
              "h-3 w-3 transition-colors",
              direction === 'desc' ? "text-blue-600" : "text-gray-300"
            )} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </th>
  );
}

export function useSorting(initialField?: string, initialDirection: SortDirection = 'desc') {
  const [sortState, setSortState] = React.useState<SortState>({
    field: initialField || null,
    direction: initialDirection,
  });

  const handleSort = (field: string) => {
    setSortState(prev => {
      if (prev.field === field) {
        // Cycling through: desc -> asc -> null -> desc
        if (prev.direction === 'desc') {
          return { field, direction: 'asc' };
        } else if (prev.direction === 'asc') {
          return { field: null, direction: null };
        } else {
          return { field, direction: 'desc' };
        }
      } else {
        // New field, start with desc
        return { field, direction: 'desc' };
      }
    });
  };

  return { sortState, handleSort };
}