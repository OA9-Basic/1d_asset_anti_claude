/**
 * Funding Progress Utilities
 *
 * Shared utilities for funding progress calculations
 */

import { Prisma } from '@prisma/client';

import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

export function calculateProgress(
  currentCollected: number | string | Prisma.Decimal,
  targetPrice: number | string | Prisma.Decimal,
  platformFee: number | string | Prisma.Decimal = 0.15
): {
  progressPercent: number;
  remainingAmount: number;
  targetWithFee: number;
  currentCollectedNum: number;
} {
  const currentCollectedNum = prismaDecimalToNumber(currentCollected);
  const targetPriceNum = prismaDecimalToNumber(targetPrice);
  const platformFeeNum = prismaDecimalToNumber(platformFee);

  const targetWithFee = targetPriceNum * (1 + platformFeeNum);
  const progressPercent = Math.min((currentCollectedNum / targetWithFee) * 100, 100);
  const remainingAmount = Math.max(targetWithFee - currentCollectedNum, 0);

  return {
    progressPercent,
    remainingAmount,
    targetWithFee,
    currentCollectedNum,
  };
}
