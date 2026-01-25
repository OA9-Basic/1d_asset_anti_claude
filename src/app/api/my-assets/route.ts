import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import type { AssetListItem } from '@/types/assets';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    // Fetch user's contributions with asset details
    const contributions = await db.contribution.findMany({
      where: { userId },
      include: {
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch user's purchases with asset details
    const purchases = await db.assetPurchase.findMany({
      where: { userId },
      include: {
        asset: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = {
      totalInvested: contributions.reduce((sum, c) => sum + c.amount, 0),
      assetsOwned: purchases.length,
      contributingCount: contributions.filter((c) => c.asset?.status === 'COLLECTING').length,
      ownedCount: purchases.length,
      completedCount: contributions.filter(
        (c) => c.asset?.status === 'AVAILABLE' || c.asset?.status === 'PURCHASED'
      ).length,
    };

    // Process and filter assets
    const allAssets: AssetListItem[] = [];

    // Add contributed assets
    contributions.forEach((contribution) => {
      const asset = contribution.asset;
      if (!asset) return;

      const platformFee = asset.platformFee || 0.15;
      const targetWithFee = asset.targetPrice * (1 + platformFee);
      const progressPercent = Math.min((Number(asset.currentCollected) / targetWithFee) * 100, 100);
      const remainingAmount = Math.max(targetWithFee - Number(asset.currentCollected), 0);

      allAssets.push({
        id: asset.id,
        title: asset.title,
        description: asset.description,
        type: asset.type,
        deliveryType: asset.deliveryType,
        targetPrice: asset.targetPrice,
        platformFee: asset.platformFee,
        currentCollected: asset.currentCollected,
        status: asset.status,
        totalPurchases: asset.totalPurchases,
        totalRevenue: asset.totalRevenue,
        thumbnail: asset.thumbnail,
        featured: asset.featured,
        createdAt: asset.createdAt.toISOString(),
        userContribution: contribution.amount,
        userExcessAmount: contribution.excessAmount,
        profitShareRatio: contribution.profitShareRatio,
        totalProfitReceived: contribution.totalProfitReceived,
        relationship: 'contributing',
        progressPercent,
        remainingAmount,
        targetWithFee,
        contributionId: contribution.id,
        contributionStatus: contribution.status,
      });
    });

    // Add purchased assets
    purchases.forEach((purchase) => {
      const asset = purchase.asset;
      if (!asset) return;

      const existingAsset = allAssets.find((a) => a.id === purchase.assetId);
      if (!existingAsset) {
        const platformFee = asset.platformFee || 0.15;
        const targetWithFee = asset.targetPrice * (1 + platformFee);
        const progressPercent = Math.min(
          (Number(asset.currentCollected) / targetWithFee) * 100,
          100
        );

        allAssets.push({
          id: asset.id,
          title: asset.title,
          description: asset.description,
          type: asset.type,
          deliveryType: asset.deliveryType,
          targetPrice: asset.targetPrice,
          platformFee: asset.platformFee,
          currentCollected: asset.currentCollected,
          status: asset.status,
          totalPurchases: asset.totalPurchases,
          totalRevenue: asset.totalRevenue,
          thumbnail: asset.thumbnail,
          featured: asset.featured,
          createdAt: asset.createdAt.toISOString(),
          relationship: 'owned',
          purchaseAmount: purchase.purchaseAmount,
          deliveryAccessKey: purchase.deliveryAccessKey,
          deliveryExpiry: purchase.deliveryExpiry ? purchase.deliveryExpiry.toISOString() : null,
          accessCount: purchase.accessCount,
          lastAccessedAt: purchase.lastAccessedAt ? purchase.lastAccessedAt.toISOString() : null,
          purchasedAt: purchase.createdAt.toISOString(),
          progressPercent,
          targetWithFee,
          purchaseId: purchase.id,
        });
      } else {
        // Asset already added from contributions, mark as owned too
        existingAsset.relationship = 'both';
        existingAsset.purchaseAmount = purchase.purchaseAmount;
        existingAsset.deliveryAccessKey = purchase.deliveryAccessKey;
        existingAsset.deliveryExpiry = purchase.deliveryExpiry
          ? purchase.deliveryExpiry.toISOString()
          : null;
        existingAsset.accessCount = purchase.accessCount;
        existingAsset.lastAccessedAt = purchase.lastAccessedAt
          ? purchase.lastAccessedAt.toISOString()
          : null;
        existingAsset.purchasedAt = purchase.createdAt.toISOString();
        existingAsset.purchaseId = purchase.id;
      }
    });

    // Remove duplicates and sort
    const uniqueAssets = Array.from(
      new Map(allAssets.map((asset) => [asset.id, asset])).values()
    ).sort((a, b) => {
      const dateA = new Date(a.contributionId ? (a.createdAt || '') : (a.purchasedAt || ''));
      const dateB = new Date(b.contributionId ? (b.createdAt || '') : (b.purchasedAt || ''));
      return dateB.getTime() - dateA.getTime();
    });

    // Filter assets based on query param
    let filteredAssets = uniqueAssets;
    if (filter !== 'all') {
      switch (filter) {
        case 'contributing':
          filteredAssets = uniqueAssets.filter(
            (asset) => asset.relationship === 'contributing' || asset.status === 'COLLECTING'
          );
          break;
        case 'owned':
          filteredAssets = uniqueAssets.filter(
            (asset) => asset.relationship === 'owned' || asset.relationship === 'both'
          );
          break;
        case 'completed':
          filteredAssets = uniqueAssets.filter(
            (asset) => asset.status === 'AVAILABLE' || asset.status === 'PURCHASED'
          );
          break;
      }
    }

    return NextResponse.json({
      assets: filteredAssets,
      stats,
    });
  } catch (error) {
    console.error('My Assets fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
