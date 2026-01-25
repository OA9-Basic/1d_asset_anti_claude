'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface EnhancedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

const variantColors = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function EnhancedProgress({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = true,
  striped = false,
  className,
  ...props
}: EnhancedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showLabel && (
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-muted',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantColors[variant],
            striped && 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]',
            animated && 'animate-[progress-stripes_1s_linear_infinite]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Indeterminate progress bar
export function IndeterminateProgress({
  size = 'md',
  variant = 'default',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-muted',
        sizeClasses[size],
        className
      )}
    >
      <div
        className={cn(
          'h-full absolute top-0 left-0 animate-[indeterminate_1.5s_infinite_ease-in-out]',
          variantColors[variant],
          'w-1/3'
        )}
      />
    </div>
  );
}

// Circular progress
export function CircularProgress({
  value = 0,
  max = 100,
  size = 40,
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  className,
}: {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-out',
            variantColors[variant]
          )}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

// Add the keyframes to the global CSS
export const progressStyles = `
  @keyframes progress-stripes {
    0% { background-position: 1rem 0; }
    100% { background-position: 0 0; }
  }

  @keyframes indeterminate {
    0% { left: -35%; }
    100% { left: 100%; }
  }
`;
