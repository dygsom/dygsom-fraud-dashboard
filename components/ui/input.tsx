/**
 * Input Component
 *
 * Reusable input component with error states, icons, and password toggle
 */

import { InputHTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

// Icons
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, leftIcon, showPasswordToggle, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const inputType = showPasswordToggle && showPassword ? 'text' : type;
    
    // Auto-detect icons for common input types
    const getDefaultIcon = () => {
      if (leftIcon) return leftIcon;
      if (type === 'email') return <MailIcon className="w-5 h-5 text-gray-400" />;
      if (type === 'password') return <LockIcon className="w-5 h-5 text-gray-400" />;
      return null;
    };

    const defaultIcon = getDefaultIcon();

    return (
      <div className="w-full">
        <div className="relative">
          {defaultIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {defaultIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              'flex h-12 w-full rounded-lg border bg-white text-sm transition-all duration-200',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              defaultIcon ? 'pl-10' : 'pl-4',
              showPasswordToggle ? 'pr-12' : 'pr-4',
              'py-3',
              // States
              !error && !isFocused && 'border-gray-200 hover:border-gray-300',
              !error && isFocused && 'border-blue-500 ring-blue-500 shadow-sm',
              error && 'border-red-500 ring-red-500',
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-2 flex items-center space-x-1">
            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
