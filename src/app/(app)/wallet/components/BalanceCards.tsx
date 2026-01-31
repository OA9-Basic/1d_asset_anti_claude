'use client';

import { Wallet as WalletIcon, DollarSign, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { BalanceData } from '../types';

interface BalanceCardsProps {
  balanceData: BalanceData | undefined;
  balanceLoading: boolean;
}

export function BalanceCards({ balanceData, balanceLoading }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Balance */}
      <Card className="border-2 border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900">
              <WalletIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 rounded-full">
              Primary
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Total Balance</p>
          {balanceLoading ? (
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              ${balanceData ? prismaDecimalToNumber(balanceData.balance).toFixed(2) : '0.00'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Withdrawable */}
      <Card className="border border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Withdrawable</p>
          {balanceLoading ? (
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              ${balanceData ? prismaDecimalToNumber(balanceData.withdrawableBalance).toFixed(2) : '0.00'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Store Credit */}
      <Card className="border border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30">
              <WalletIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Store Credit</p>
          {balanceLoading ? (
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              ${balanceData ? prismaDecimalToNumber(balanceData.storeCredit).toFixed(2) : '0.00'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Deposited */}
      <Card className="border border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Total Deposited</p>
          {balanceLoading ? (
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              ${balanceData ? prismaDecimalToNumber(balanceData.totalDeposited).toFixed(2) : '0.00'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
