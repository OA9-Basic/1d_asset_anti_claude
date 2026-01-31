'use client';

import { PlusCircle, ShoppingCart, Wallet, Share2 } from 'lucide-react';
import Link from 'next/link';

import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  userId: string;
}

/**
 * Quick Actions Component - Premium Dark Theme
 *
 * Compact 2x2 grid of uniform action buttons.
 * Features:
 * - Consistent zinc-900/50 background
 * - Hover: violet-500/10 bg with violet-500/50 border
 * - Sophisticated "Control Keys" aesthetic
 * - No rainbow colors
 */
export function QuickActions({ userId }: QuickActionsProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?ref=${userId}`);
  };

  const actions = [
    {
      icon: PlusCircle,
      label: 'Request',
      description: 'New asset',
      href: '/request',
    },
    {
      icon: ShoppingCart,
      label: 'Market',
      description: 'Browse',
      href: '/marketplace',
    },
    {
      icon: Wallet,
      label: 'Wallet',
      description: 'Manage',
      href: '/wallet',
    },
    {
      icon: Share2,
      label: 'Invite',
      description: 'Share',
      action: handleShare,
    },
  ];

  return (
    <UnifiedCard variant="default" padding="md" className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Quick Actions</CardTitle>
        <CardDescription className="text-xs">Get started</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <button
                onClick={action.action}
                className={cn(
                  'group relative flex flex-col items-center justify-center',
                  'p-3 rounded-lg border',
                  'transition-all duration-200',
                  'bg-zinc-900/50 dark:bg-zinc-900/50',
                  'border-zinc-800 dark:border-zinc-800',
                  'hover:border-violet-500/50 hover:bg-violet-500/10',
                  'hover:text-violet-200',
                  'active:scale-[0.98]'
                )}
              >
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-violet-400 transition-colors" />
                <span className="text-xs font-medium text-zinc-300 group-hover:text-violet-200 mt-1.5">
                  {action.label}
                </span>
                <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
                  {action.description}
                </span>
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
