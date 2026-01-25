export async function distributeRevenue(_assetId: string, _amount: number | string) {
  // Gap loan feature is not yet implemented - requires gapLoan table in Prisma schema
  throw new Error('Revenue distribution with gap loan repayment is not yet available')

  /*
  const revenueAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  return await db.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({
      where: { id: assetId },
    })

    if (!asset) {
      throw new Error('Asset not found')
    }

    const activeGapLoan = await tx.gapLoan.findFirst({
      where: {
        assetId: assetId,
        status: 'ACTIVE',
      },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    })

    if (!activeGapLoan || !activeGapLoan.user.wallet) {
      await tx.asset.update({
        where: { id: assetId },
        data: {
          metadata: {
            ...((asset.metadata as any) || {}),
            lastRevenueDistribution: {
              amount: revenueAmount,
              timestamp: new Date().toISOString(),
              type: 'PLATFORM_PROFIT',
            },
          },
        },
      })

      return {
        type: 'PLATFORM_PROFIT',
        amount: revenueAmount,
        message: 'No active gap loan. Revenue goes to platform.',
      }
    }

    const remainingLoan = activeGapLoan.loanAmount - activeGapLoan.repaidAmount
    const repaymentAmount = Math.min(revenueAmount, remainingLoan)
    const platformProfit = revenueAmount - repaymentAmount

    const balanceBefore = activeGapLoan.user.wallet.balance
    const balanceAfter = balanceBefore + repaymentAmount

    await tx.transaction.create({
      data: {
        walletId: activeGapLoan.user.wallet.id,
        type: 'GAP_LOAN_REPAYMENT',
        status: 'COMPLETED',
        amount: repaymentAmount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        referenceId: activeGapLoan.id,
        referenceType: 'GAP_LOAN_REPAYMENT',
        description: `Gap loan repayment for asset: ${asset.title}`,
      },
    })

    await tx.wallet.update({
      where: { id: activeGapLoan.user.wallet.id },
      data: { balance: balanceAfter },
    })

    const newRepaidAmount = activeGapLoan.repaidAmount + repaymentAmount
    const newRemainingAmount = activeGapLoan.loanAmount - newRepaidAmount

    const loanUpdateData: any = {
      repaidAmount: newRepaidAmount,
      remainingAmount: newRemainingAmount,
    }

    if (newRemainingAmount <= 0) {
      loanUpdateData.status = 'FULLY_REPAID'
      loanUpdateData.fullyRepaidAt = new Date()
    }

    await tx.gapLoan.update({
      where: { id: activeGapLoan.id },
      data: loanUpdateData,
    })

    await tx.asset.update({
      where: { id: assetId },
      data: {
        metadata: {
          ...((asset.metadata as any) || {}),
          lastRevenueDistribution: {
            amount: revenueAmount,
            timestamp: new Date().toISOString(),
            type: 'LOAN_REPAYMENT',
            repaymentAmount: repaymentAmount,
            platformProfit: platformProfit,
            loanStatus: loanUpdateData.status || 'ACTIVE',
          },
        },
      },
    })

    return {
      type: 'LOAN_REPAYMENT',
      loanId: activeGapLoan.id,
      lenderId: activeGapLoan.userId,
      repaymentAmount: repaymentAmount,
      platformProfit: platformProfit,
      loanStatus: loanUpdateData.status || 'ACTIVE',
      remainingLoan: newRemainingAmount,
      newLenderBalance: balanceAfter,
    }
  })
  */
}
