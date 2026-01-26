/**
 * ALCHEMY WEBHOOK HANDLER
 * Receives real-time deposit notifications from Alchemy
 */

import { createHash } from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { NETWORKS, TOKEN_CONTRACTS, verifyTransaction } from '@/lib/blockchain/alchemy';
import { db } from '@/lib/db';

// ============================================================================
// WEBHOOK SECRET (from env)
// ============================================================================

const WEBHOOK_SECRET = process.env.ALCHEMY_WEBHOOK_SECRET;
const WEBHOOK_SIGNATURE_HEADER = 'x-alchemy-signature';

// ============================================================================
// POST /api/webhooks/alchemy
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Verify webhook signature
    const signature = req.headers.get(WEBHOOK_SIGNATURE_HEADER);
    const body = await req.text();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify signature (prevent replay attacks)
    const expectedSignature = createHash('sha256')
      .update(WEBHOOK_SECRET + body)
      .digest('hex');

    if (signature !== expectedSignature) {
      await db.webhookLog.create({
        data: {
          type: 'ALCHEMY_NOTIFY',
          source: 'alchemy',
          payload: body,
          signature,
          processed: false,
          processingError: 'Invalid signature',
          receivedAt: new Date(),
        },
      });

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 2. Parse webhook payload
    const payload = JSON.parse(body);

    // Log webhook
    const webhookLog = await db.webhookLog.create({
      data: {
        type: 'ALCHEMY_NOTIFY',
        source: 'alchemy',
        webhookId: payload.webhookId,
        eventId: payload.id,
        payload: body,
        signature,
        receivedAt: new Date(),
      },
    });

    // 3. Extract transaction data
    if (payload.type !== 'ADDRESS_ACTIVITY') {
      return NextResponse.json({ success: true, message: 'Not an address activity' });
    }

    const activity = payload.event.activity[0];
    if (!activity) {
      return NextResponse.json({ success: true, message: 'No activity' });
    }

    const txHash = activity.hash;
    const toAddress = activity.toAddress || activity.log?.address;

    if (!toAddress || !txHash) {
      return NextResponse.json({ success: true, message: 'Invalid activity data' });
    }

    // 4. Find pending deposit order
    const depositOrder = await db.depositOrder.findFirst({
      where: {
        depositAddress: toAddress.toLowerCase(),
        status: { in: ['CREATED', 'AWAITING_PAYMENT', 'CONFIRMING'] },
        expiresAt: { gt: new Date() },
      },
    });

    if (!depositOrder) {
      // No matching deposit order
      await webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          processed: true,
          processingError: 'No matching deposit order',
          txHash,
        },
      });

      return NextResponse.json({ success: true, message: 'No matching order' });
    }

    // 5. Determine if it's a token or native transfer
    const isTokenTransfer = activity.category === 'token';
    const tokenSymbol = depositOrder.cryptoCurrency;

    let tokenAddress: string | undefined;
    if (isTokenTransfer) {
      if (tokenSymbol.includes('POLYGON')) {
        tokenAddress = TOKEN_CONTRACTS.POLYGON[
          tokenSymbol.replace('_POLYGON', '') as keyof typeof TOKEN_CONTRACTS.POLYGON
        ];
      } else if (tokenSymbol.includes('BSC')) {
        tokenAddress = TOKEN_CONTRACTS.BSC[
          tokenSymbol.replace('_BSC', '') as keyof typeof TOKEN_CONTRACTS.BSC
        ];
      }
    }

    // 6. Verify transaction on blockchain
    const expectedAmount = BigInt(Math.floor(depositOrder.cryptoAmount * 1e18));

    const verification = await verifyTransaction(
      txHash,
      depositOrder.depositAddress,
      expectedAmount,
      depositOrder.network as keyof typeof NETWORKS,
      tokenAddress
    );

    // 7. Update deposit order status
    if (verification.verified) {
      // Transaction verified!
      await db.$transaction([
        // Update deposit order
        db.depositOrder.update({
          where: { id: depositOrder.id },
          data: {
            status: 'COMPLETED',
            txHash,
            confirmations: verification.confirmations,
            receivedAmount: Number(verification.receivedAmount) / 1e18,
            confirmedAt: new Date(),
            completedAt: new Date(),
          },
        }),

        // Create transaction record
        db.transaction.create({
          data: {
            userId: depositOrder.userId,
            type: 'DEPOSIT',
            amount: depositOrder.usdAmount,
            currency: 'USD', // Store as USD value
            status: 'COMPLETED',
            network: depositOrder.network,
            txHash,
            confirmations: verification.confirmations,
            verified: true,
            verifiedAt: new Date(),
            verifiedFrom: 'ALCHEMY',
            depositOrderId: depositOrder.id,
          },
        }),

        // Update wallet balance
        db.wallet.update({
          where: { userId: depositOrder.userId },
          data: {
            balance: { increment: depositOrder.usdAmount },
            withdrawableBalance: { increment: depositOrder.usdAmount },
          },
        }),

        // Mark webhook as processed
        db.webhookLog.update({
          where: { id: webhookLog.id },
          data: {
            processed: true,
            depositOrderId: depositOrder.id,
            txHash,
          },
        }),

        // Log success
        db.auditLog.create({
          data: {
            userId: depositOrder.userId,
            relatedOrderId: depositOrder.id,
            relatedTxHash: txHash,
            action: 'DEPOSIT_VERIFIED',
            category: 'CRYPTO',
            severity: 'INFO',
            success: true,
            details: JSON.stringify({
              amount: depositOrder.usdAmount,
              cryptoCurrency: depositOrder.cryptoCurrency,
              network: depositOrder.network,
              confirmations: verification.confirmations,
            }),
          },
        }),
      ]);

      // TODO: Trigger sweep to cold storage if balance exceeds threshold

      return NextResponse.json({
        success: true,
        message: 'Deposit verified and credited',
        depositOrderId: depositOrder.id,
      });
    }

    // 8. Handle pending/confirming states
    if (verification.confirmations > 0 && verification.confirmations < depositOrder.requiredConfirmations) {
      await db.depositOrder.update({
        where: { id: depositOrder.id },
        data: {
          status: 'CONFIRMING',
          txHash,
          confirmations: verification.confirmations,
        },
      });

      await db.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          processed: true,
          depositOrderId: depositOrder.id,
          txHash,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Confirming deposit (${verification.confirmations}/${depositOrder.requiredConfirmations})`,
        confirmations: verification.confirmations,
      });
    }

    // 9. Handle errors
    await db.webhookLog.update({
      where: { id: webhookLog.id },
      data: {
        processed: true,
        processingError: verification.error,
        txHash,
      },
    });

    return NextResponse.json({
      success: false,
      error: verification.error,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
