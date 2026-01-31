'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { Contribution } from '../types';

interface InvestmentInfoProps {
  userContribution: Contribution;
}

export function InvestmentInfo({ userContribution }: InvestmentInfoProps) {
  return (
    <Card className="border-2 bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Your Investment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Invested Amount</p>
          <p className="text-2xl font-bold text-blue-600">
            ${prismaDecimalToNumber(userContribution.excessAmount).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Profit Received</p>
          <p className="text-xl font-semibold text-green-600">
            ${prismaDecimalToNumber(userContribution.totalProfitReceived).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Remaining Investment</p>
          <p className="text-lg font-medium">
            $
            {(
              prismaDecimalToNumber(userContribution.excessAmount) - prismaDecimalToNumber(userContribution.totalProfitReceived)
            ).toFixed(2)}
          </p>
        </div>
        <Progress
          value={
            (userContribution.totalProfitReceived / userContribution.excessAmount) *
            100
          }
          className="h-2"
        />
        <p className="text-xs text-muted-foreground">
          You&apos;ll receive profit share from future purchases until fully refunded
        </p>
      </CardContent>
    </Card>
  );
}
