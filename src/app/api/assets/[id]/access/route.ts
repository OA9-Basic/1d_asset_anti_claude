import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetId = params.id;

    // Check if user has access via contribution or purchase
    const [contribution, purchase] = await Promise.all([
      db.contribution.findFirst({
        where: {
          assetId: assetId,
          userId: userId,
          status: { in: ['ACTIVE', 'CONVERTED_TO_INVESTMENT'] },
        },
      }),
      db.assetPurchase.findFirst({
        where: {
          assetId: assetId,
          userId: userId,
        },
      }),
    ]);

    const hasAccess = !!(contribution || purchase);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied - You need to purchase this asset first' },
        { status: 403 }
      );
    }

    const asset = await db.asset.findUnique({
      where: { id: assetId },
      select: {
        id: true,
        title: true,
        type: true,
        deliveryType: true,
        deliveryUrl: true,
        deliveryKey: true,
        streamUrl: true,
        externalAccessUrl: true,
        externalCredentials: true,
        status: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Update access count if purchased
    if (purchase) {
      await db.assetPurchase.update({
        where: { id: purchase.id },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });
    }

    // Return access details based on delivery type
    return NextResponse.json({
      access: true,
      asset: {
        id: asset.id,
        title: asset.title,
        type: asset.type,
        deliveryType: asset.deliveryType,
      },
      delivery: {
        type: asset.deliveryType,
        downloadUrl: asset.deliveryUrl,
        streamUrl: asset.streamUrl,
        externalAccessUrl: asset.externalAccessUrl,
        externalCredentials: asset.externalCredentials,
      },
      accessMethod: getAccessMethod(asset.deliveryType),
    });
  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function getAccessMethod(deliveryType: string): string {
  switch (deliveryType) {
    case 'DOWNLOAD':
      return 'direct_download';
    case 'STREAM':
      return 'embedded_player';
    case 'EXTERNAL':
      return 'external_redirect';
    case 'HYBRID':
      return 'multi_format';
    default:
      return 'direct_download';
  }
}

// POST - Record asset access for analytics
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assetId = params.id;
    const body = await req.json();
    const { accessType: _accessType } = body || {};

    // Update purchase access record
    const purchase = await db.assetPurchase.findFirst({
      where: {
        assetId: assetId,
        userId: userId,
      },
    });

    if (purchase) {
      await db.assetPurchase.update({
        where: { id: purchase.id },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Access recording error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
