'use client';

import { PlusCircle, ShoppingCart, Wallet, Share2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  userId: string;
}

/**
 * Quick Actions Component - Premium Dark Theme
 *
 * Control Center style grid layout for quick actions.
 * Features:
 * - 2x2 grid of square action buttons
 * - Consistent icon styling
 * - Hover effects with scale animation
 * - Each action has a distinct color accent
 */
export function QuickActions({ userId }: QuickActionsProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?ref=${userId}`);
  };

  const actions = [
    {
      icon: PlusCircle,
      label: 'Request Asset',
      description: 'Submit new request',
      href: '/request',
      color: 'violet',
      bgColor: 'bg-violet-50 dark:bg-violet-950/40',
      iconColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-200 dark:border-violet-900/50',
    },
    {
      icon: ShoppingCart,
      label: 'Marketplace',
      description: 'Browse assets',
      href: '/marketplace',
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
    },
    {
      icon: Wallet,
      label: 'Wallet',
      description: 'Manage funds',
      href: '/wallet',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
    },
    {
      icon: Share2,
      label: 'Invite',
      description: 'Share & earn',
      action: handleShare,
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
    },
  ];

  return (
    <UnifiedCard variant="default" padding="md" className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with these options</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <button
                onClick={action.action}
                className={cn(
                  'group relative flex flex-col items-center justify-center',
                  'p-4 rounded-xl border',
                  'transition-all duration-200',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  'hover:shadow-md',
                  action.bgColor,
                  action.borderColor,
                  'hover:bg-opacity-80'
                )}
              >
                <div className={cn('p-3 rounded-xl mb-2', action.bgColor)}>
                  <Icon className={cn('w-6 h-6', action.iconColor)} />
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {action.label}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {action.description}
                </span>
                <ArrowUpRight className={cn(
                  'absolute top-2 right-2 w-4 h-4 opacity-0 -translate-x-1 translate-y-1',
                  'transition-all duration-200',
                  'group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0',
                  action.iconColor
                )} />
              </button>
            );

            if (action.href) {
              return (
                <Link key={action.label} href={action.href} className="block">
                  {content}
                </Link>
              );
            }
            return <div key={action.label}>{content}</div>;
          })}
        </div>
      </CardContent>
    </UnifiedCard>
  );
}
