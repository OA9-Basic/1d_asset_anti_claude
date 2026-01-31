'use client';

import { Wallet } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { DashboardStats } from '../types';

interface BalanceBreakdownProps {
  stats?: DashboardStats;
}

/**
 * Balance Breakdown Component - Premium Dark Theme
 *
 * Clean layout with proper spacing, neutral colors, and elegant button.
 */
export function BalanceBreakdown({ stats }: BalanceBreakdownProps) {
  if (!stats) return null;

  return (
    <UnifiedCard variant="default" padding="md">
      <CardHeader>
        <CardTitle className="text-base text-zinc-100">Balance Breakdown</CardTitle>
        <CardDescription className="text-xs">Your wallet at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Row 1: Available Balance */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-900">
          <span className="text-sm text-zinc-500 font-medium">Available Balance</span>
          <span className="font-mono text-lg text-zinc-100">
            ${prismaDecimalToNumber(stats.walletBalance).toFixed(2)}
          </span>
        </div>

        {/* Row 2: Withdrawable */}
        <div className="flex items-center justify-between py-2 border-b border-zinc-900">
          <span className="text-sm text-zinc-500 font-medium">Withdrawable</span>
          <span className="font-mono text-lg text-zinc-100">
            ${prismaDecimalToNumber(stats.withdrawableBalance).toFixed(2)}
          </span>
        </div>

        {/* Row 3: Store Credit - no border */}
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-500 font-medium">Store Credit</span>
          <span className="font-mono text-lg text-zinc-100">
            ${prismaDecimalToNumber(stats.storeCredit).toFixed(2)}
          </span>
        </div>

        {/* Premium Button - High contrast zinc outline */}
        <Link href="/wallet/deposit" className="block pt-2">
          <Button
            variant="outline"
            className="w-full h-11 bg-zinc-100 text-black border-0 hover:bg-zinc-200 font-medium"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Add Funds
          </Button>
        </Link>
      </CardContent>
    </UnifiedCard>
  );
}
