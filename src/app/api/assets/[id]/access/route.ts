import { NextRequest, NextResponse } from 'next/server';

import { getUserFromToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiLogger, securityLogger } from '@/lib/loggers';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';

/**
 * GET /api/assets/[id]/access
 * Check if user has access to an asset
 *
 * SECURITY: Rate limited to prevent access scraping and abuse
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      securityLogger.warn('Unauthorized asset access attempt', {
        assetId: params.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting per user per asset (strict - prevents scraping)
    const rateLimitKey = `asset_access:${userId}:${params.id}`;
    const rateLimit = checkRateLimit(rateLimitKey, RateLimitPresets.strict);

    if (!rateLimit.success) {
      securityLogger.warn('Asset access rate limit exceeded', {
        userId,
        assetId: params.id,
        rateLimit,
      });
      return NextResponse.json(
        {
          error: 'Too many access checks',
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
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
      securityLogger.warn('Asset access denied - no purchase/contribution found', {
        userId,
        assetId,
      });
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
      apiLogger.error('Asset not found during access check', {
        assetId,
        userId,
      });
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

      apiLogger.info('Asset access recorded', {
        assetId,
        userId,
        accessType: 'purchase',
        purchaseId: purchase.id,
        accessCount: purchase.accessCount + 1,
      });
    } else {
      apiLogger.info('Asset access granted via contribution', {
        assetId,
        userId,
        accessType: 'contribution',
        contributionId: contribution?.id,
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
    apiLogger.error('Access check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      assetId: params.id,
      stack: error instanceof Error ? error.stack : undefined,
    });
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

/**
 * POST /api/assets/[id]/access
 * Record asset access for analytics
 *
 * SECURITY: Rate limited to prevent spamming analytics
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for access recording (moderate - allows legitimate use)
    const rateLimitKey = `asset_access_record:${userId}`;
    const rateLimit = checkRateLimit(rateLimitKey, RateLimitPresets.api);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many access recording requests',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    const assetId = params.id;
    const body = await req.json();
    const { accessType: accessType = 'unknown' } = body || {};

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

      apiLogger.info('Asset access recorded via POST', {
        assetId,
        userId,
        accessType,
        purchaseId: purchase.id,
        newAccessCount: purchase.accessCount + 1,
      });
    } else {
      apiLogger.warn('Attempted to record access without purchase', {
        assetId,
        userId,
        accessType,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    apiLogger.error('Access recording error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      assetId: params.id,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
