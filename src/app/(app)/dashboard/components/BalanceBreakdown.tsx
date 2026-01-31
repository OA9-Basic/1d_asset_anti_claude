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

export function BalanceBreakdown({ stats }: BalanceBreakdownProps) {
  if (!stats) return null;

  return (
    <UnifiedCard variant="default" padding="md">
      <CardHeader>
        <CardTitle className="text-lg">Balance Breakdown</CardTitle>
        <CardDescription>Your wallet at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Available Balance</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            ${prismaDecimalToNumber(stats.walletBalance).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Withdrawable</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            ${prismaDecimalToNumber(stats.withdrawableBalance).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Store Credit</span>
          <span className="font-semibold text-violet-600 dark:text-violet-400">
            ${prismaDecimalToNumber(stats.storeCredit).toFixed(2)}
          </span>
        </div>
        <Link href="/wallet/deposit">
          <Button className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90">
            <Wallet className="w-4 h-4 mr-2" />
            Add Funds
          </Button>
        </Link>
      </CardContent>
    </UnifiedCard>
  );
}
