'use client';

/**
 * DYGSOM Logo Component
 * 
 * Reusable logo component with different sizes and variants
 * Following React best practices for component composition
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface DygsomLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'gradient';
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const variantClasses = {
  default: '',
  white: 'brightness-0 invert',
  gradient: 'drop-shadow-lg',
};

export function DygsomLogo({ 
  size = 'md', 
  variant = 'default',
  className,
  priority = false 
}: DygsomLogoProps) {
  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <Image
        src="/dygsom-logo.svg"
        alt="DYGSOM Logo"
        width={64}
        height={64}
        priority={priority}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

interface DygsomBrandProps {
  logoSize?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function DygsomBrand({
  logoSize = 'lg',
  showTagline = true,
  orientation = 'horizontal',
  className
}: DygsomBrandProps) {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <div className={cn(
      'flex items-center',
      isHorizontal ? 'space-x-3' : 'flex-col space-y-2 text-center',
      className
    )}>
      <DygsomLogo 
        size={logoSize} 
        variant="gradient"
        priority={true}
      />
      <div className={cn(isHorizontal ? 'text-left' : 'text-center')}>
        <h1 className="text-2xl font-bold dygsom-text-primary leading-tight">
          DYGSOM
        </h1>
        {showTagline && (
          <p className="text-sm text-slate-600 -mt-1">
            Fraud Detection
          </p>
        )}
      </div>
    </div>
  );
}