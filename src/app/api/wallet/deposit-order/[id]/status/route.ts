/**
 * DEPOSIT ORDER STATUS API
 * Real-time status updates for deposit orders
 */

import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/db';

// ============================================================================
// GET /api/wallet/deposit-order/[id]/status
// ============================================================================

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const session = await getServerSession(req);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const depositOrderId = params.id;

    // 2. Fetch deposit order with latest status
    const depositOrder = await db.depositOrder.findFirst({
      where: {
        id: depositOrderId,
        userId: session.user.id, // Security: Only user's own orders
      },
      include: {
        transactions: {
          where: { depositOrderId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!depositOrder) {
      return NextResponse.json(
        { error: 'Deposit order not found' },
        { status: 404 }
      );
    }

    // 3. Calculate status info
    const now = new Date();
    const isExpired = depositOrder.expiresAt < now;
    const timeRemaining = Math.max(0, depositOrder.expiresAt.getTime() - now.getTime());

    // 4. Determine current status
    const status = depositOrder.status;
    let statusMessage = '';

    switch (status) {
      case 'CREATED':
        statusMessage = 'Awaiting payment';
        break;
      case 'AWAITING_PAYMENT':
        statusMessage = 'Payment detected, waiting for confirmations';
        break;
      case 'CONFIRMING':
        statusMessage = `Confirming transaction (${depositOrder.confirmations}/${depositOrder.requiredConfirmations})`;
        break;
      case 'COMPLETED':
        statusMessage = 'Deposit completed and credited';
        break;
      case 'EXPIRED':
        statusMessage = 'Order expired. Please create a new deposit order.';
        break;
      case 'FAILED':
        statusMessage = 'Deposit failed. Please contact support.';
        break;
      default:
        statusMessage = 'Unknown status';
    }

    // 5. Check if price lock is still valid
    const priceLockValid = depositOrder.priceExpiresAt > now;

    // 6. Return status
    return NextResponse.json({
      success: true,
      depositOrder: {
        id: depositOrder.id,
        status,
        statusMessage,
        isExpired,
        timeRemaining: Math.floor(timeRemaining / 1000), // Seconds
        timeRemainingMinutes: Math.ceil(timeRemaining / 60000), // Minutes

        // Amount details
        usdAmount: depositOrder.usdAmount,
        cryptoAmount: depositOrder.cryptoAmount,
        cryptoCurrency: depositOrder.cryptoCurrency,

        // Price lock info
        priceLocked: {
          usdPrice: depositOrder.priceAtCreation,
          expiresAt: depositOrder.priceExpiresAt,
          isValid: priceLockValid,
        },

        // Payment details
        depositAddress: depositOrder.depositAddress,
        network: depositOrder.network,

        // Confirmation tracking
        confirmations: depositOrder.confirmations,
        requiredConfirmations: depositOrder.requiredConfirmations,
        confirmationProgress: Math.min(
          100,
          (depositOrder.confirmations / depositOrder.requiredConfirmations) * 100
        ),

        // Transaction info (if completed)
        txHash: depositOrder.txHash,
        confirmedAt: depositOrder.confirmedAt,
        completedAt: depositOrder.completedAt,

        // Timestamps
        createdAt: depositOrder.createdAt,
        expiresAt: depositOrder.expiresAt,
      },

      // Transaction record (if exists)
      transaction: depositOrder.transactions[0] ? {
        id: depositOrder.transactions[0].id,
        amount: depositOrder.transactions[0].amount,
        balanceBefore: depositOrder.transactions[0].balanceBefore,
        balanceAfter: depositOrder.transactions[0].balanceAfter,
        verified: depositOrder.transactions[0].verified,
        verifiedAt: depositOrder.transactions[0].verifiedAt,
      } : null,
    });

  } catch (error) {
    console.error('Get deposit status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposit status' },
      { status: 500 }
    );
  }
}
