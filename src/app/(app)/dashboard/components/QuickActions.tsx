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
 * Vertical list of large, comfortable full-width buttons.
 * Professional menu/control panel appearance.
 */
export function QuickActions({ userId }: QuickActionsProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?ref=${userId}`);
  };

  const actions = [
    {
      icon: PlusCircle,
      label: 'Request an Asset',
      description: 'Submit a new asset request',
      href: '/request',
    },
    {
      icon: ShoppingCart,
      label: 'Browse Marketplace',
      description: 'Explore available assets',
      href: '/marketplace',
    },
    {
      icon: Wallet,
      label: 'Manage Wallet',
      description: 'View balance and transactions',
      href: '/wallet',
    },
    {
      icon: Share2,
      label: 'Invite Friends',
      description: 'Share and earn rewards',
      action: handleShare,
    },
  ];

  return (
    <UnifiedCard variant="default" padding="md" className="h-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-base text-zinc-100">Quick Actions</CardTitle>
        <CardDescription className="text-xs">Get started</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            const content = (
              <button
                onClick={action.action}
                className={cn(
                  'group flex items-center justify-start',
                  'h-14 px-4 gap-4',
                  'bg-zinc-900 border border-zinc-800 rounded-lg',
                  'hover:bg-zinc-800 hover:border-zinc-700',
                  'transition-all duration-200',
                  'active:scale-[0.99]'
                )}
              >
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
                <div className="flex flex-col items-start flex-1">
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-white">
                    {action.label}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {action.description}
                  </span>
                </div>
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
