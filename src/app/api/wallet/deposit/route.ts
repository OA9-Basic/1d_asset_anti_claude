/**
 * DEPRECATED - LEGACY DEPOSIT ENDPOINT
 *
 * ⚠️ WARNING: This endpoint is deprecated and should NOT be used!
 *
 * Please use the new deposit system:
 * - POST /api/wallet/deposit-order (Create deposit order with price lock)
 * - GET /api/wallet/deposit-order/[id]/status (Check deposit status)
 * - Webhook: /api/webhooks/alchemy (Automatic verification via Alchemy)
 *
 * The new system provides:
 * ✅ Real-time blockchain verification via Alchemy webhooks
 * ✅ Price locking for 15 minutes
 * ✅ HD wallet address generation
 * ✅ Automatic confirmations tracking
 * ✅ Cold storage sweep functionality
 *
 * This old endpoint is kept only for backward compatibility during migration.
 * It will be removed in version 2.0
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  // Return error directing to new endpoint
  return NextResponse.json(
    {
      error: 'DEPRECATED_ENDPOINT',
      message: 'This deposit endpoint is deprecated. Please use the new deposit system.',
      newEndpoint: '/api/wallet/deposit-order',
      documentation: 'See CRYPTO_PAYMENT_IMPLEMENTATION.md for details',
      alternatives: [
        'POST /api/wallet/deposit-order - Create deposit order with price lock',
        'GET /api/wallet/deposit-order/[id]/status - Check deposit status',
      ],
    },
    { status: 410 } // 410 Gone
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'DEPRECATED_ENDPOINT',
      message: 'This deposit endpoint is deprecated. Please use the new deposit system.',
      newEndpoint: '/api/wallet/deposit-order',
      documentation: 'See CRYPTO_PAYMENT_IMPLEMENTATION.md for details',
      alternatives: [
        'POST /api/wallet/deposit-order - Create deposit order with price lock',
        'GET /api/wallet/deposit-order/[id]/status - Check deposit status',
      ],
    },
    { status: 410 }
  );
}
