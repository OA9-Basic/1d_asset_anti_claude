'use client';

import { ArrowDownCircle, ArrowUpCircle, Clock, TrendingUp, TrendingDown, DollarSign, CheckCircle2 } from 'lucide-react';
import type { Transaction } from '../types';

interface TransactionTypeProps {
  type: string;
}

export function TransactionType({ type }: TransactionTypeProps) {
  const typeConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
    DEPOSIT: {
      label: 'Deposit',
      className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
      icon: ArrowDownCircle,
    },
    WITHDRAWAL: {
      label: 'Withdrawal',
      className: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
      icon: ArrowUpCircle,
    },
    WITHDRAWAL_REQUEST: {
      label: 'Withdrawal Request',
      className: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30',
      icon: Clock,
    },
    CONTRIBUTION: {
      label: 'Contribution',
      className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
      icon: TrendingUp,
    },
    CONTRIBUTION_REFUND: {
      label: 'Refund',
      className: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
      icon: TrendingDown,
    },
    PROFIT_SHARE: {
      label: 'Profit',
      className: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30',
      icon: DollarSign,
    },
    PURCHASE: {
      label: 'Purchase',
      className: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30',
      icon: CheckCircle2,
    },
  };

  const config = typeConfig[type] || {
    label: type,
    className: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950/30',
    icon: DollarSign,
  };
  const TypeIcon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${config.className}`}>
        <TypeIcon className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}
