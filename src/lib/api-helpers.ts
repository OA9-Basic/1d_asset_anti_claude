/**
 * API Response Helpers
 *
 * Standardized response formatters for API routes
 * Handles Decimal to number conversion automatically
 */

import type { Decimal } from '@prisma/client/runtime/library';

import { prismaDecimalToNumber } from './prisma-decimal';

interface WalletRecord {
  balance: Decimal | number | string | null;
  withdrawableBalance: Decimal | number | string | null;
  storeCredit: Decimal | number | string | null;
  totalDeposited?: Decimal | number | string | null;
  totalWithdrawn?: Decimal | number | string | null;
  totalConvertedToCredit?: Decimal | number | string | null;
  totalContributed?: Decimal | number | string | null;
  totalProfitReceived?: Decimal | number | string | null;
  lockedBalance?: Decimal | number | string | null;
  [key: string]: unknown;
}

interface TransactionRecord {
  amount: Decimal | number | string | null;
  balanceBefore: Decimal | number | string | null;
  balanceAfter: Decimal | number | string | null;
  [key: string]: unknown;
}

interface AssetRecord {
  targetPrice: Decimal | number | string | null;
  platformFee: Decimal | number | string | null;
  platformFeeAfterExcess?: Decimal | number | string | null;
  currentCollected: Decimal | number | string | null;
  totalRevenue: Decimal | number | string | null;
  totalProfitDistributed?: Decimal | number | string | null;
  [key: string]: unknown;
}

interface ContributionRecord {
  amount: Decimal | number | string | null;
  excessAmount?: Decimal | number | string | null;
  profitShareRatio?: Decimal | number | string | null;
  totalProfitReceived?: Decimal | number | string | null;
  [key: string]: unknown;
}

interface WithdrawalRecord {
  amount: Decimal | number | string | null;
  [key: string]: unknown;
}

interface GapLoanRecord {
  loanAmount: Decimal | number | string | null;
  repaidAmount: Decimal | number | string | null;
  remainingAmount: Decimal | number | string | null;
  [key: string]: unknown;
}

/**
 * Format wallet for API response (converts Decimal to number)
 */
export function formatWalletForResponse<T extends WalletRecord>(wallet: T | null | undefined): T | null | undefined {
  if (!wallet) return wallet;
  return {
    ...wallet,
    balance: prismaDecimalToNumber(wallet.balance),
    withdrawableBalance: prismaDecimalToNumber(wallet.withdrawableBalance),
    storeCredit: prismaDecimalToNumber(wallet.storeCredit),
    totalDeposited: wallet.totalDeposited !== undefined ? prismaDecimalToNumber(wallet.totalDeposited) : undefined,
    totalWithdrawn: wallet.totalWithdrawn !== undefined ? prismaDecimalToNumber(wallet.totalWithdrawn) : undefined,
    totalConvertedToCredit: wallet.totalConvertedToCredit !== undefined ? prismaDecimalToNumber(wallet.totalConvertedToCredit) : undefined,
    totalContributed: wallet.totalContributed !== undefined ? prismaDecimalToNumber(wallet.totalContributed) : undefined,
    totalProfitReceived: wallet.totalProfitReceived !== undefined ? prismaDecimalToNumber(wallet.totalProfitReceived) : undefined,
    lockedBalance: wallet.lockedBalance !== undefined ? prismaDecimalToNumber(wallet.lockedBalance) : undefined,
  };
}

/**
 * Format transaction for API response
 */
export function formatTransactionForResponse<T extends TransactionRecord>(transaction: T | null | undefined): T | null | undefined {
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
export function formatAssetForResponse<T extends AssetRecord>(asset: T | null | undefined): T | null | undefined {
  if (!asset) return asset;
  return {
    ...asset,
    targetPrice: prismaDecimalToNumber(asset.targetPrice),
    platformFee: prismaDecimalToNumber(asset.platformFee),
    platformFeeAfterExcess: asset.platformFeeAfterExcess !== undefined ? prismaDecimalToNumber(asset.platformFeeAfterExcess) : undefined,
    currentCollected: prismaDecimalToNumber(asset.currentCollected),
    totalRevenue: prismaDecimalToNumber(asset.totalRevenue),
    totalProfitDistributed: asset.totalProfitDistributed !== undefined ? prismaDecimalToNumber(asset.totalProfitDistributed) : undefined,
  };
}

/**
 * Format contribution for API response
 */
export function formatContributionForResponse<T extends ContributionRecord>(contribution: T | null | undefined): T | null | undefined {
  if (!contribution) return contribution;
  return {
    ...contribution,
    amount: prismaDecimalToNumber(contribution.amount),
    excessAmount: contribution.excessAmount !== undefined ? prismaDecimalToNumber(contribution.excessAmount) : undefined,
    profitShareRatio: contribution.profitShareRatio !== undefined ? prismaDecimalToNumber(contribution.profitShareRatio) : undefined,
    totalProfitReceived: contribution.totalProfitReceived !== undefined ? prismaDecimalToNumber(contribution.totalProfitReceived) : undefined,
  };
}

/**
 * Format withdrawal request for API response
 */
export function formatWithdrawalForResponse<T extends WithdrawalRecord>(withdrawal: T | null | undefined): T | null | undefined {
  if (!withdrawal) return withdrawal;
  return {
    ...withdrawal,
    amount: prismaDecimalToNumber(withdrawal.amount),
  };
}

/**
 * Format gap loan for API response
 */
export function formatGapLoanForResponse<T extends GapLoanRecord>(gapLoan: T | null | undefined): T | null | undefined {
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
