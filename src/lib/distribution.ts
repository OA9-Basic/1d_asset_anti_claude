import { db } from './db';
import { subtract, add, parseMoney } from './decimal';
import { createLogger } from './logger';

const logger = createLogger('distribution');

/**
 * Distribute revenue from an asset
 * - First repays any active gap loan
 * - Remaining goes to platform profit
 */
export async function distributeRevenue(assetId: string, amount: number | string) {
  const revenueAmount = typeof amount === 'string' ? parseMoney(amount) : amount;

  logger.info({ assetId, amount: revenueAmount }, 'Starting revenue distribution');

  return await db.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    const activeGapLoan = await tx.gapLoan.findFirst({
      where: {
        assetId: assetId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!activeGapLoan || !activeGapLoan.user.wallet) {
      await tx.asset.update({
        where: { id: assetId },
        data: {
          metadata: {
            ...((asset.metadata as Record<string, unknown>) || {}),
            lastRevenueDistribution: {
              amount: revenueAmount,
              timestamp: new Date().toISOString(),
              type: 'PLATFORM_PROFIT',
            },
          },
        },
      });

      logger.info({ assetId, amount: revenueAmount }, 'No active gap loan, revenue goes to platform');

      return {
        type: 'PLATFORM_PROFIT',
        amount: revenueAmount,
        message: 'No active gap loan. Revenue goes to platform.',
      };
    }

    // Calculate loan repayment using safe decimal operations
    const remainingLoan = parseMoney(subtract(activeGapLoan.loanAmount, activeGapLoan.repaidAmount));
    const repaymentAmount = Math.min(revenueAmount, remainingLoan);
    const platformProfit = parseMoney(subtract(revenueAmount, repaymentAmount));

    const balanceBefore = activeGapLoan.user.wallet.balance;
    const balanceAfter = parseMoney(add(balanceBefore, repaymentAmount));

    await tx.transaction.create({
      data: {
        walletId: activeGapLoan.user.wallet.id,
        type: 'GAP_LOAN_REPAYMENT',
        status: 'COMPLETED',
        amount: repaymentAmount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        referenceId: activeGapLoan.id,
        referenceType: 'GAP_LOAN_REPAYMENT',
        description: `Gap loan repayment for asset: ${asset.title}`,
      },
    });

    await tx.wallet.update({
      where: { id: activeGapLoan.user.wallet.id },
      data: { balance: balanceAfter },
    });

    const newRepaidAmount = parseMoney(add(activeGapLoan.repaidAmount, repaymentAmount));
    const newRemainingAmount = parseMoney(subtract(activeGapLoan.loanAmount, newRepaidAmount));

    const loanUpdateData: Record<string, unknown> = {
      repaidAmount: newRepaidAmount,
      remainingAmount: newRemainingAmount,
    };

    if (newRemainingAmount <= 0) {
      loanUpdateData.status = 'FULLY_REPAID';
      loanUpdateData.fullyRepaidAt = new Date();
    }

    await tx.gapLoan.update({
      where: { id: activeGapLoan.id },
      data: loanUpdateData,
    });

    await tx.asset.update({
      where: { id: assetId },
      data: {
        metadata: {
          ...((asset.metadata as Record<string, unknown>) || {}),
          lastRevenueDistribution: {
            amount: revenueAmount,
            timestamp: new Date().toISOString(),
            type: 'LOAN_REPAYMENT',
            repaymentAmount: repaymentAmount,
            platformProfit: platformProfit,
            loanStatus: loanUpdateData.status || 'ACTIVE',
          },
        },
      },
    });

    logger.info({
      assetId,
      loanId: activeGapLoan.id,
      repaymentAmount,
      platformProfit,
      loanStatus: loanUpdateData.status || 'ACTIVE',
    }, 'Revenue distributed to gap loan');

    return {
      type: 'LOAN_REPAYMENT',
      loanId: activeGapLoan.id,
      lenderId: activeGapLoan.userId,
      repaymentAmount: repaymentAmount,
      platformProfit: platformProfit,
      loanStatus: loanUpdateData.status || 'ACTIVE',
      remainingLoan: newRemainingAmount,
      newLenderBalance: balanceAfter,
    };
  });
}

