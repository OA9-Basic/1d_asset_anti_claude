import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest) {
  // Gap funding feature is not yet implemented - requires gapLoan table in Prisma schema
  return NextResponse.json(
    {
      error: 'Gap funding feature is not yet available',
      message: 'This feature requires database schema updates',
    },
    { status: 501 }
  );

  /*
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { assetId } = gapFundSchema.parse(body)

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      })

      if (!user?.wallet) {
        throw new Error('Wallet not found')
      }

      const asset = await tx.asset.findUnique({
        where: { id: assetId },
      })

      if (!asset) {
        throw new Error('Asset not found')
      }

      if (asset.status !== 'COLLECTING') {
        throw new Error('Asset is not accepting gap funding')
      }

      const gap = asset.targetPrice - asset.currentCollected

      if (gap <= 0) {
        throw new Error('Asset is already fully funded')
      }

      if (user.wallet.balance < gap) {
        throw new Error('Insufficient balance for gap funding')
      }

      const existingLoan = await tx.gapLoan.findUnique({
        where: {
          userId_assetId: {
            userId: user.id,
            assetId: assetId,
          },
        },
      })

      if (existingLoan) {
        throw new Error('Gap loan already exists for this asset')
      }

      const balanceBefore = user.wallet.balance
      const balanceAfter = balanceBefore - gap

      const debitTransaction = await tx.transaction.create({
        data: {
          walletId: user.wallet.id,
          type: 'GAP_LOAN_DISBURSEMENT',
          status: 'COMPLETED',
          amount: gap,
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          referenceId: assetId,
          referenceType: 'GAP_LOAN',
          description: `Gap funding for asset: ${asset.title}`,
        },
      })

      await tx.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: balanceAfter },
      })

      const newCollected = asset.currentCollected + gap

      const gapLoan = await tx.gapLoan.create({
        data: {
          userId: user.id,
          assetId: assetId,
          loanAmount: gap,
          repaidAmount: 0,
          remainingAmount: gap,
          status: 'ACTIVE',
        },
      })

      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          currentCollected: newCollected,
          status: 'PURCHASED',
          purchasedAt: new Date(),
        },
      })

      return {
        gapLoan,
        debitTransaction,
        updatedAsset,
        gapAmount: gap,
        newBalance: balanceAfter,
      }
    })

    return NextResponse.json({
      loanId: result.gapLoan.id,
      transactionId: result.debitTransaction.id,
      gapAmount: result.gapAmount,
      assetStatus: result.updatedAsset.status,
      newBalance: result.newBalance,
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors,
      }, { status: 400 })
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      if (message.includes('insufficient')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      if (message.includes('not found') || message.includes('wallet')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (message.includes('not accepting') || message.includes('already funded') || message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error('Gap fund error:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
  */
}
