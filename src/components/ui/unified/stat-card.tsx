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
 * StatCard Component - Premium Dark Theme
 *
 * Unified statistics card inspired by Wallet page balance cards.
 * Features:
 * - Consistent icon backgrounds with subtle tinting
 * - Optional trend indicators
 * - Multiple color variants
 * - Hover animations with border transitions
 * - Tabular nums for stable number rendering
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon: Icon, trend, variant = 'default', className }, ref) => {
    const variantStyles = {
      default: {
        iconBg: 'bg-zinc-100 dark:bg-zinc-900',
        iconColor: 'text-zinc-700 dark:text-zinc-300',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      primary: {
        iconBg: 'bg-violet-100 dark:bg-violet-950/40',
        iconColor: 'text-violet-600 dark:text-violet-400',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      success: {
        iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      warning: {
        iconBg: 'bg-amber-100 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        trendUp: 'text-emerald-600 dark:text-emerald-400',
        trendDown: 'text-red-600 dark:text-red-400',
      },
      info: {
        iconBg: 'bg-blue-100 dark:bg-blue-950/40',
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
          // Base card styles
          'border border-zinc-200 dark:border-zinc-800',
          'hover:border-zinc-300 dark:hover:border-zinc-700',
          'rounded-xl bg-white dark:bg-zinc-950/50',
          'p-6 transition-all duration-300',
          // Animation
          'fade-enter',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={cn('p-2.5 rounded-lg', styles.iconBg)}>
            <Icon className={cn('w-5 h-5', styles.iconColor)} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={cn(
                  'font-medium tabular-nums',
                  trend.direction === 'up' && styles.trendUp,
                  trend.direction === 'down' && styles.trendDown,
                  trend.direction === 'neutral' && 'text-zinc-500 dark:text-zinc-400'
                )}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>

        <p className={cn('text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1')}>
          {title}
        </p>

        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight-premium tabular-nums">
          {value}
        </p>

        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            {description}
          </p>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
