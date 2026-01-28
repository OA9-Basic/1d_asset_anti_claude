/**
 * API Response Helpers
 *
 * Standardized response formatters for API routes
 * Handles Decimal to number conversion automatically
 */

import { prismaDecimalToNumber } from './prisma-decimal';

/**
 * Format wallet for API response (converts Decimal to number)
 */
export function formatWalletForResponse(wallet: any) {
  if (!wallet) return wallet;
  return {
    ...wallet,
    balance: prismaDecimalToNumber(wallet.balance),
    withdrawableBalance: prismaDecimalToNumber(wallet.withdrawableBalance),
    storeCredit: prismaDecimalToNumber(wallet.storeCredit),
    totalDeposited: prismaDecimalToNumber(wallet.totalDeposited),
    totalWithdrawn: prismaDecimalToNumber(wallet.totalWithdrawn),
    totalConvertedToCredit: prismaDecimalToNumber(wallet.totalConvertedToCredit),
    totalContributed: prismaDecimalToNumber(wallet.totalContributed),
    totalProfitReceived: prismaDecimalToNumber(wallet.totalProfitReceived),
    lockedBalance: prismaDecimalToNumber(wallet.lockedBalance),
  };
}

/**
 * Format transaction for API response
 */
export function formatTransactionForResponse(transaction: any) {
  if (!transaction) return transaction;
  return {
    ...transaction,
    amount: prismaDecimalToNumber(transaction.amount),
    balanceBefore: prismaDecimalToNumber(transaction.balanceBefore),
    balanceAfter: prismaDecimalToNumber(transaction.balanceAfter),
  };
}

/**
 * Format asset for API response
 */
export function formatAssetForResponse(asset: any) {
  if (!asset) return asset;
  return {
    ...asset,
    targetPrice: prismaDecimalToNumber(asset.targetPrice),
    platformFee: prismaDecimalToNumber(asset.platformFee),
    platformFeeAfterExcess: prismaDecimalToNumber(asset.platformFeeAfterExcess),
    currentCollected: prismaDecimalToNumber(asset.currentCollected),
    totalRevenue: prismaDecimalToNumber(asset.totalRevenue),
    totalProfitDistributed: prismaDecimalToNumber(asset.totalProfitDistributed),
  };
}

/**
 * Format contribution for API response
 */
export function formatContributionForResponse(contribution: any) {
  if (!contribution) return contribution;
  return {
    ...contribution,
    amount: prismaDecimalToNumber(contribution.amount),
    excessAmount: prismaDecimalToNumber(contribution.excessAmount),
    profitShareRatio: prismaDecimalToNumber(contribution.profitShareRatio),
    totalProfitReceived: prismaDecimalToNumber(contribution.totalProfitReceived),
  };
}

/**
 * Format withdrawal request for API response
 */
export function formatWithdrawalForResponse(withdrawal: any) {
  if (!withdrawal) return withdrawal;
  return {
    ...withdrawal,
    amount: prismaDecimalToNumber(withdrawal.amount),
  };
}

/**
 * Format gap loan for API response
 */
export function formatGapLoanForResponse(gapLoan: any) {
  if (!gapLoan) return gapLoan;
  return {
    ...gapLoan,
    loanAmount: prismaDecimalToNumber(gapLoan.loanAmount),
    repaidAmount: prismaDecimalToNumber(gapLoan.repaidAmount),
    remainingAmount: prismaDecimalToNumber(gapLoan.remainingAmount),
  };
}

/**
 * Format array of items using a formatter function
 */
export function formatArrayForResponse<T>(items: T[], formatter: (item: T) => T): T[] {
  return items.map(formatter);
}

/**
 * Paginated response helper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Error response helper
 */
export function errorResponse(error: string | Error, statusCode?: number) {
  const message = error instanceof Error ? error.message : error;
  return {
    success: false,
    error: message,
    ...(statusCode && { statusCode }),
  };
}
