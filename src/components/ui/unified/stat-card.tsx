import { type LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Stat Card Props
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

/**
 * StatCard Component
 *
 * Unified statistics card inspired by Wallet page balance cards.
 * Features:
 * - Consistent icon backgrounds
 * - Optional trend indicators
 * - Multiple color variants
 * - Hover animations
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon: Icon, trend, variant = 'default', className }, ref) => {
    const variantStyles = {
      default: {
        iconBg: 'bg-neutral-100 dark:bg-neutral-900',
        iconColor: 'text-neutral-700 dark:text-neutral-300',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      primary: {
        iconBg: 'bg-violet-50 dark:bg-violet-950/30',
        iconColor: 'text-violet-600 dark:text-violet-400',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      success: {
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      warning: {
        iconBg: 'bg-amber-50 dark:bg-amber-950/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      info: {
        iconBg: 'bg-blue-50 dark:bg-blue-950/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
    };

    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700',
          'rounded-xl bg-white dark:bg-black',
          'p-6 transition-all duration-300',
          'animate-in fade-in slide-in-from-bottom-4 duration-500',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={cn('p-2.5 rounded-xl', styles.iconBg)}>
            <Icon className={cn('w-5 h-5', styles.iconColor)} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={cn(
                  'font-medium',
                  trend.direction === 'up' && styles.trendUp,
                  trend.direction === 'down' && styles.trendDown,
                  trend.direction === 'neutral' && 'text-neutral-500'
                )}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>

        <p className={cn('text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1')}>
          {title}
        </p>

        <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          {value}
        </p>

        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {description}
          </p>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
