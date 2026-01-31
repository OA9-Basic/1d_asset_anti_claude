/**
 * Funding Progress Component
 *
 * Displays the funding progress bar for COLLECTING assets
 */

import { Prisma } from '@prisma/client';

import { Progress } from '@/components/ui/progress';

import { calculateProgress } from './funding-progress-utils';

interface FundingProgressProps {
  currentCollected: number | string | Prisma.Decimal;
  targetPrice: number | string | Prisma.Decimal;
  platformFee?: number | string | Prisma.Decimal;
}

export function FundingProgress({
  currentCollected,
  targetPrice,
  platformFee = 0.15,
}: FundingProgressProps) {
  const { progressPercent, remainingAmount, targetWithFee, currentCollectedNum } =
    calculateProgress(currentCollected, targetPrice, platformFee);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Progress
        </span>
        <span className="text-slate-600 dark:text-slate-400">
          ${currentCollectedNum.toFixed(2)} of ${targetWithFee.toFixed(2)}
        </span>
      </div>

      <div className="relative">
        <Progress value={progressPercent} className="h-3" />
        <div
          className="absolute top-0 left-0 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-300 pointer-events-none"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-500">
        <span>{progressPercent.toFixed(0)}% funded</span>
        <span>${remainingAmount.toFixed(2)} remaining</span>
      </div>
    </div>
  );
}
