'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Select Components
 * 
 * Custom select dropdown with search and keyboard navigation
 */

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ options, value, onValueChange, placeholder = "Select an option...", disabled, className, searchable = false }, ref) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(option =>
      !searchable || search === '' || option.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
          setSearch('');
          setFocusedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          if (open && focusedIndex >= 0) {
            const option = filteredOptions[focusedIndex];
            if (option && !option.disabled) {
              onValueChange?.(option.value);
              setOpen(false);
              setSearch('');
              setFocusedIndex(-1);
            }
          } else {
            setOpen(!open);
          }
          break;
        case 'Escape':
          setOpen(false);
          setSearch('');
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!open) {
            setOpen(true);
          } else {
            setFocusedIndex(prev => 
              prev < filteredOptions.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (open) {
            setFocusedIndex(prev => 
              prev > 0 ? prev - 1 : filteredOptions.length - 1
            );
          }
          break;
        case ' ':
          if (!searchable) {
            event.preventDefault();
            setOpen(!open);
          }
          break;
      }
    };

    const handleOptionClick = (option: SelectOption) => {
      if (!option.disabled) {
        onValueChange?.(option.value);
        setOpen(false);
        setSearch('');
        setFocusedIndex(-1);
      }
    };

    return (
      <div ref={containerRef} className="relative">
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            open && "ring-2 ring-blue-500 border-blue-500",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={cn(
            "block truncate",
            !selectedOption && "text-gray-500"
          )}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              open && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md bg-white py-1 shadow-lg border border-gray-200">
            {searchable && (
              <div className="px-2 py-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  placeholder="Search options..."
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}
            
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white",
                      focusedIndex === index && "bg-gray-100",
                      value === option.value && "bg-blue-50 text-blue-600 font-medium"
                    )}
                    disabled={option.disabled}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, type SelectOption };