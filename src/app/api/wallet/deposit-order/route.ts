/**
 * CREATE DEPOSIT ORDER API
 * Generates HD wallet address and locks crypto price for 15 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerSession } from '@/lib/auth';
import { NETWORKS, TOKEN_CONTRACTS, formatCryptoAmount as formatCryptoAmountAlchemy } from '@/lib/blockchain/alchemy';
import { usdToCrypto } from '@/lib/blockchain/coinlore';
import { deriveWalletWithPrivateKey, toChecksumAddress } from '@/lib/blockchain/hd-wallet';
import { db } from '@/lib/db';
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limit';

// ============================================================================
// VALIDATION
// ============================================================================

const createDepositOrderSchema = z.object({
  usdAmount: z.number().positive().max(10000, 'Maximum deposit is $10,000'),
  cryptoCurrency: z.enum([
    'ETH',
    'USDT_POLYGON',
    'USDC_POLYGON',
    'USDT_BSC',
    'USDC_BSC',
    'BNB',
    'MATIC',
  ]),
});

// ============================================================================
// POST /api/wallet/deposit-order
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(req);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting for deposits
    const rateLimit = checkRateLimit(`deposit:${session.user.id}`, RateLimitPresets.deposit);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: 'Too many deposit requests',
          resetTime: rateLimit.resetTime,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate body
    const body = await req.json();
    const validation = createDepositOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { usdAmount, cryptoCurrency } = validation.data;

    // 3. Determine network from currency
    let network: keyof typeof NETWORKS;
    let _tokenAddress: string | undefined;

    switch (cryptoCurrency) {
      case 'ETH':
        network = 'ETHEREUM_MAINNET';
        break;
      case 'USDT_POLYGON':
        network = 'POLYGON_MAINNET';
        _tokenAddress = TOKEN_CONTRACTS.POLYGON.USDT;
        break;
      case 'USDC_POLYGON':
        network = 'POLYGON_MAINNET';
        _tokenAddress = TOKEN_CONTRACTS.POLYGON.USDC;
        break;
      case 'USDT_BSC':
        network = 'BSC_MAINNET';
        _tokenAddress = TOKEN_CONTRACTS.BSC.USDT;
        break;
      case 'USDC_BSC':
        network = 'BSC_MAINNET';
        _tokenAddress = TOKEN_CONTRACTS.BSC.USDC;
        break;
      case 'BNB':
      case 'MATIC':
        network = 'BSC_MAINNET'; // MATIC uses BSC network for low fees
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported currency' },
          { status: 400 }
        );
    }

    // 4. Get real-time price from CoinGecko
    const priceQuote = await usdToCrypto(usdAmount, cryptoCurrency, {
      slippageTolerance: 0.01, // 1%
      safetyMargin: 0.01, // Add 1% safety margin
    });

    // 5. Generate HD wallet address
    // Get next unused index from database
    const lastOrder = await db.depositOrder.findFirst({
      where: { network: network as any, userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const nextIndex = (lastOrder?.id ? parseInt(lastOrder.id.slice(0, 8), 16) : 0) + 1;

    // Generate wallet with encrypted private key
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    const hdWalletMnemonic = process.env.HD_WALLET_MNEMONIC;
    if (!hdWalletMnemonic) {
      throw new Error('HD_WALLET_MNEMONIC not configured');
    }

    const wallet = await deriveWalletWithPrivateKey(
      hdWalletMnemonic,
      nextIndex,
      network as 'ETHEREUM' | 'POLYGON' | 'BSC' | 'BITCOIN',
      encryptionKey
    );

    // 6. Calculate expiry (15 minutes from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    // 7. Create deposit order
    const depositOrder = await db.depositOrder.create({
      data: {
        userId: session.user.id,
        usdAmount,
        cryptoAmount: priceQuote.cryptoAmount,
        cryptoCurrency,
        network: network as any,
        priceAtCreation: priceQuote.usdPrice,
        priceExpiresAt: priceQuote.expiresAt,
        depositAddress: toChecksumAddress(wallet.address),
        derivationPath: wallet.derivationPath,
        privateKeyEncrypted: wallet.privateKeyEncrypted,
        status: 'CREATED',
        expiresAt,
        requiredConfirmations: NETWORKS[network].requiredConfirmations,
      },
    });

    // 8. Log audit event
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DEPOSIT_ORDER_CREATED',
        category: 'CRYPTO',
        severity: 'INFO',
        details: JSON.stringify({
          depositOrderId: depositOrder.id,
          usdAmount,
          cryptoAmount: priceQuote.cryptoAmount,
          cryptoCurrency,
          network,
        }),
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    // 9. Return deposit details
    return NextResponse.json({
      success: true,
      depositOrder: {
        id: depositOrder.id,
        usdAmount,
        cryptoAmount: formatCryptoAmountAlchemy(
          BigInt(Math.floor(priceQuote.cryptoAmount * 1e18)),
          18
        ),
        cryptoCurrency,
        network: NETWORKS[network].name,
        depositAddress: depositOrder.depositAddress,
        qrCode: `ethereum:${depositOrder.depositAddress}`, // For EVM wallets
        expiresAt: depositOrder.expiresAt,
        priceLocked: {
          usdPrice: priceQuote.usdPrice,
          expiresAt: priceQuote.expiresAt,
        },
        confirmationsRequired: depositOrder.requiredConfirmations,
      },
    });

  } catch (error) {
    console.error('Deposit order creation error:', error);

    await db.auditLog.create({
      data: {
        action: 'DEPOSIT_ORDER_ERROR',
        category: 'CRYPTO',
        severity: 'ERROR',
        details: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(
      { error: 'Failed to create deposit order' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/wallet/deposit-order
// List user's active deposit orders
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const depositOrders = await db.depositOrder.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['CREATED', 'AWAITING_PAYMENT', 'CONFIRMING'] },
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      depositOrders: depositOrders.map(order => ({
        id: order.id,
        usdAmount: order.usdAmount,
        cryptoAmount: order.cryptoAmount,
        cryptoCurrency: order.cryptoCurrency,
        network: NETWORKS[order.network as keyof typeof NETWORKS]?.name,
        depositAddress: order.depositAddress,
        status: order.status,
        expiresAt: order.expiresAt,
        confirmations: order.confirmations,
        requiredConfirmations: order.requiredConfirmations,
      })),
    });

  } catch (error) {
    console.error('Get deposit orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deposit orders' },
      { status: 500 }
    );
  }
}
