import { db } from './db';
import {
  prismaDecimalToNumber,
  isPrismaDecimalLessThan,
  isPrismaDecimalGreaterThanOrEqual,
  subtractPrismaDecimals,
  addPrismaDecimals,
  isPrismaDecimalGreaterThan,
  multiplyPrismaDecimals,
} from './prisma-decimal';

export interface ContributionResult {
  success: boolean;
  assetId: string;
  userId: string;
  amount: number;
  excessAmount: number;
  isFullyFunded: boolean;
  remainingNeeded: number;
  message: string;
}

/**
 * Process a user contribution to an asset
 * Users can contribute any amount (not just $1)
 * Excess amounts over the base $1 are tracked for profit sharing
 */
export async function contributeToAsset(
  userId: string,
  assetId: string,
  amount: number
): Promise<ContributionResult> {
  // Validate amount
  if (amount < 1) {
    return {
      success: false,
      assetId,
      userId,
      amount,
      excessAmount: 0,
      isFullyFunded: false,
      remainingNeeded: 0,
      message: 'Minimum contribution is $1',
    };
  }

  return await db.$transaction(async (tx) => {
    // Get asset
    const asset = await tx.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Only allow contributions to COLLECTING assets
    if (asset.status !== 'COLLECTING') {
      return {
        success: false,
        assetId,
        userId,
        amount,
        excessAmount: 0,
        isFullyFunded: false,
        remainingNeeded: 0,
        message: `Asset is ${asset.status.toLowerCase()}, not accepting contributions`,
      };
    }

    // Get user wallet
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check balance
    if (isPrismaDecimalLessThan(wallet.balance, amount)) {
      return {
        success: false,
        assetId,
        userId,
        amount,
        excessAmount: 0,
        isFullyFunded: false,
        remainingNeeded: 0,
        message: 'Insufficient balance',
      };
    }

    // Check for existing contribution to determine if entry fee is already paid
    const existingContribution = await tx.contribution.findFirst({
      where: {
        userId,
        assetId,
      },
    });

    // Calculate target amount with platform fee
    const platformFee = prismaDecimalToNumber(asset.platformFee) || 0.15;
    const targetAmount = multiplyPrismaDecimals(asset.targetPrice, 1 + platformFee);
    const currentCollected = asset.currentCollected;
    const remainingNeeded = Math.max(0, prismaDecimalToNumber(subtractPrismaDecimals(targetAmount, currentCollected)));

    // Cap contribution at remaining needed amount
    // If remaining needed is small (e.g. $0.50), we accept it to close the pool
    const contributionAmount = Math.min(amount, remainingNeeded);

    if (contributionAmount <= 0) {
      return {
        success: false,
        assetId,
        userId,
        amount,
        excessAmount: 0,
        isFullyFunded: currentCollected >= targetAmount,
        remainingNeeded: 0,
        message: 'Asset is already fully funded',
      };
    }

    // Excess amount logic:
    // If user already contributed, they paid the $1 fee. New amount is fully excess.
    // If new user, they pay $1 fee. Excess is amount - 1.
    let excessAmount = 0;
    if (existingContribution) {
      excessAmount = contributionAmount;
    } else {
      excessAmount = Math.max(0, contributionAmount - 1);
    }

    // Deduct from wallet
    const balanceBefore = wallet.balance;
    const balanceAfter = subtractPrismaDecimals(balanceBefore, contributionAmount);

    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'CONTRIBUTION',
        status: 'COMPLETED',
        amount: contributionAmount,
        balanceBefore,
        balanceAfter,
        referenceId: assetId,
        referenceType: 'ASSET_CONTRIBUTION',
        description: `Contribution to: ${asset.title}`,
      },
    });

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let _contribution: any = undefined;

    if (existingContribution) {
      _contribution = await tx.contribution.update({
        where: { id: existingContribution.id },
        data: {
          amount: addPrismaDecimals(existingContribution.amount, contributionAmount),
          excessAmount: addPrismaDecimals(existingContribution.excessAmount, excessAmount),
          isInvestment:
            isPrismaDecimalGreaterThan(addPrismaDecimals(existingContribution.excessAmount, excessAmount), 0) ||
            existingContribution.isInvestment,
        },
      });
    } else {
      _contribution = await tx.contribution.create({
        data: {
          userId,
          assetId,
          amount: contributionAmount,
          excessAmount,
          isInvestment: excessAmount > 0,
        },
      });
    }

    // Update asset
    const newCollected = addPrismaDecimals(currentCollected, contributionAmount);
    const isFullyFunded = isPrismaDecimalGreaterThanOrEqual(newCollected, prismaDecimalToNumber(targetAmount));

    await tx.asset.update({
      where: { id: assetId },
      data: {
        currentCollected: newCollected,
        status: isFullyFunded ? 'PURCHASED' : 'COLLECTING',
        purchasedAt: isFullyFunded ? new Date() : null,
      },
    });

    if (isFullyFunded) {
      // Mark all contributions as investments for profit sharing
      await tx.contribution.updateMany({
        where: { assetId },
        data: { isInvestment: true },
      });

      // Calculate profit share ratios for all contributors
      const allContributions = await tx.contribution.findMany({
        where: { assetId },
      });

      const totalExcess = allContributions.reduce((sum, c) => sum + prismaDecimalToNumber(c.excessAmount), 0);

      for (const c of allContributions) {
        if (isPrismaDecimalGreaterThan(c.excessAmount, 0) && totalExcess > 0) {
          await tx.contribution.update({
            where: { id: c.id },
            data: { profitShareRatio: multiplyPrismaDecimals(c.excessAmount, 1 / totalExcess) },
          });
        }
      }

      return {
        success: true,
        assetId,
        userId,
        amount,
        excessAmount,
        isFullyFunded: true,
        remainingNeeded: 0,
        message: `Asset fully funded! Your contribution: $${amount.toFixed(2)} (excess: $${excessAmount.toFixed(2)})`,
      };
    }

    return {
      success: true,
      assetId,
      userId,
      amount,
      excessAmount,
      isFullyFunded: false,
      remainingNeeded: prismaDecimalToNumber(subtractPrismaDecimals(targetAmount, newCollected)),
      message: `Contribution successful! $${prismaDecimalToNumber(subtractPrismaDecimals(targetAmount, newCollected)).toFixed(2)} still needed`,
    };
  });
}

/**
 * Get contribution statistics for an asset
 */
export async function getAssetContributionStats(assetId: string) {
  const contributions = await db.contribution.findMany({
    where: { assetId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      },
    },
    orderBy: { amount: 'desc' },
  });

  const totalContributors = contributions.length;
  const totalCollected = contributions.reduce((sum, c) => sum + prismaDecimalToNumber(c.amount), 0);
  const totalExcess = contributions.reduce((sum, c) => sum + prismaDecimalToNumber(c.excessAmount), 0);
  const investors = contributions.filter((c) => c.isInvestment);

  return {
    totalContributors,
    totalCollected,
    totalExcess,
    totalInvestors: investors.length,
    contributions: contributions.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.user.firstName || c.user.email,
      amount: prismaDecimalToNumber(c.amount),
      excessAmount: prismaDecimalToNumber(c.excessAmount),
      isInvestment: c.isInvestment,
      profitShareRatio: prismaDecimalToNumber(c.profitShareRatio),
      totalProfitReceived: prismaDecimalToNumber(c.totalProfitReceived),
    })),
  };
}

/**
 * Get user's contributions with profit tracking
 */
export async function getUserContributions(userId: string) {
  const contributions = await db.contribution.findMany({
    where: { userId },
    include: {
      asset: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          status: true,
          type: true,
          deliveryType: true,
          totalRevenue: true,
          totalPurchases: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return contributions.map((c) => ({
    id: c.id,
    asset: {
      ...c.asset,
      totalRevenue: prismaDecimalToNumber(c.asset.totalRevenue),
    },
    amount: prismaDecimalToNumber(c.amount),
    excessAmount: prismaDecimalToNumber(c.excessAmount),
    isInvestment: c.isInvestment,
    profitShareRatio: prismaDecimalToNumber(c.profitShareRatio),
    totalProfitReceived: prismaDecimalToNumber(c.totalProfitReceived),
    status: c.status,
    createdAt: c.createdAt,
  }));
}
