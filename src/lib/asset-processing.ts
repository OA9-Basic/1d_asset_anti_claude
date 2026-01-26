import { Prisma } from '@prisma/client';

import { generateSecureAccessKey } from './auth';
import { db } from './db';

export interface ProcessingResult {
  success: boolean;
  assetId: string;
  message: string;
  contributorsRefunded?: number;
  totalRefunded?: number;
  errors?: string[];
}

/**
 * Process an asset that has been fully funded
 * This should be called by admin after purchasing the actual asset
 *
 * Flow:
 * 1. Asset reaches full funding
 * 2. Admin receives notification
 * 3. Admin purchases the actual course/product
 * 4. Admin calls this function to process the asset
 * 5. Contributors get access + refunds based on contribution timing
 */
export interface DeliveryData {
  deliveryUrl?: string;
  streamUrl?: string;
  deliveryKey?: string;
  externalAccessUrl?: string;
  externalCredentials?: Record<string, unknown>;
}

export async function processFundedAsset(
  assetId: string,
  deliveryData: DeliveryData = {}
): Promise<ProcessingResult> {
  return await db.$transaction(async (tx) => {
    // Get asset with all contributions
    const asset = await tx.asset.findUnique({
      where: { id: assetId },
      include: {
        contributions: {
          include: {
            user: {
              include: {
                wallet: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.status !== 'PURCHASED') {
      throw new Error('Asset must be in PURCHASED status to process');
    }

    // Calculate base price (without platform fee)
    // const basePrice = asset.targetPrice;

    let contributorsProcessed = 0;
    const errors: string[] = [];

    // Process all contributors - ensure they get access
    for (const contribution of asset.contributions) {
      try {
        if (!contribution.user.wallet) {
          errors.push(`User ${contribution.userId} has no wallet`);
          continue;
        }

        // Create asset purchase record for contributor
        const existingPurchase = await tx.assetPurchase.findFirst({
          where: {
            userId: contribution.userId,
            assetId: assetId,
          },
        });

        if (!existingPurchase) {
          // SECURITY FIX: Use cryptographically secure random key generation
          const accessKey = generateSecureAccessKey();

          await tx.assetPurchase.create({
            data: {
              userId: contribution.userId,
              assetId: assetId,
              purchaseAmount: 1, // Contributors effectively paid $1 for access
              deliveryAccessKey: accessKey,
              deliveryExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            },
          });
        }

        contributorsProcessed++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to process contribution ${contribution.id}: ${errorMsg}`);
        console.error('Error processing contribution:', error);
      }
    }

    // Update asset status to AVAILABLE and save delivery info
    await tx.asset.update({
      where: { id: assetId },
      data: {
        status: 'AVAILABLE',
        availableAt: new Date(),
        deliveryUrl: deliveryData.deliveryUrl || asset.deliveryUrl,
        streamUrl: deliveryData.streamUrl || asset.streamUrl,
        deliveryKey: deliveryData.deliveryKey || asset.deliveryKey,
        externalAccessUrl: deliveryData.externalAccessUrl || asset.externalAccessUrl,
        externalCredentials: (deliveryData.externalCredentials || asset.externalCredentials) as Prisma.InputJsonValue,
        metadata: {
          ...((asset.metadata as Record<string, unknown>) || {}),
          processedAt: new Date().toISOString(),
          contributorsProcessed,
        },
      },
    });

    const totalExcessInvestment = asset.contributions.reduce((sum, c) => sum + c.excessAmount, 0);

    const message = `Asset processed successfully. ${contributorsProcessed} contributors granted access. Total excess investment: $${totalExcessInvestment.toFixed(2)} (will be refunded through profit distribution)${
      errors.length > 0 ? `. ${errors.length} error(s) occurred.` : ''
    }`;

    return {
      success: true,
      assetId,
      message,
      contributorsRefunded: contributorsProcessed,
      totalRefunded: totalExcessInvestment,
      errors: errors.length > 0 ? errors : undefined,
    };
  });
}

/**
 * Check if a user has access to an asset
 * Returns details about how they got access and what they paid
 */
export async function checkUserAssetAccess(userId: string, assetId: string) {
  // Check if user has a purchase record (includes both direct purchases and processed contributors)
  const purchase = await db.assetPurchase.findFirst({
    where: {
      userId,
      assetId,
    },
  });

  if (purchase) {
    return {
      hasAccess: true,
      accessType: 'PURCHASE',
      purchaseAmount: purchase.purchaseAmount,
      accessKey: purchase.deliveryAccessKey,
      expiry: purchase.deliveryExpiry,
    };
  }

  // Check if user contributed (for assets not yet processed)
  const contribution = await db.contribution.findFirst({
    where: {
      userId,
      assetId,
      status: { in: ['ACTIVE', 'CONVERTED_TO_INVESTMENT'] },
    },
  });

  if (contribution) {
    // Get asset to check if it's been processed
    const asset = await db.asset.findUnique({
      where: { id: assetId },
      select: { status: true },
    });

    // If asset is AVAILABLE, contributor should have a purchase record
    // If they don't, something went wrong in processing
    if (asset?.status === 'AVAILABLE') {
      return {
        hasAccess: false,
        message: 'Asset processed but access not granted. Contact support.',
      };
    }

    // Asset is still in COLLECTING or PURCHASED status
    return {
      hasAccess: false,
      accessType: 'CONTRIBUTION_PENDING',
      contributionAmount: contribution.amount,
      excessAmount: contribution.excessAmount,
      message: 'You have contributed. Access will be granted once the asset is processed.',
    };
  }

  return {
    hasAccess: false,
  };
}

/**
 * Calculate effective purchase price for a contributor
 * Based on their contribution timing and amount
 */
export function calculateContributorEffectivePrice(
  contributionAmount: number,
  excessAmount: number,
  assetTargetPrice: number
) {
  // Contributors pay the base price for the product
  // Any excess is refunded when asset is processed
  return {
    basePrice: assetTargetPrice,
    paid: contributionAmount,
    excess: excessAmount,
    effectivePrice: assetTargetPrice,
    refundEligible: excessAmount > 0 ? excessAmount : 0,
  };
}
