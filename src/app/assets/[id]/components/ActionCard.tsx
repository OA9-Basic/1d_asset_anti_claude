'use client';

import { CheckCircle2, Clock, Loader2, ShoppingCart, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { Asset, Contribution } from '../types';

interface ActionCardProps {
  asset: Asset;
  hasAccess: boolean;
  contributionsCount: number;
  userContribution: Contribution | null;
  onMutate: () => void;
}

export function ActionCard({ asset, hasAccess, contributionsCount, userContribution: _userContribution, onMutate }: ActionCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [contributionAmount, setContributionAmount] = useState('1');
  const [isContributing, setIsContributing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const targetWithFee = asset.targetPrice * (1 + asset.platformFee);
  const progressPercent = Math.min((asset.currentCollected / targetWithFee) * 100, 100);
  const remainingAmount = Math.max(targetWithFee - asset.currentCollected, 0);

  const statusConfig = {
    COLLECTING: {
      label: 'Funding',
      bgLight: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      icon: Clock,
    },
    PURCHASED: {
      label: 'Processing',
      bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: Clock,
    },
    AVAILABLE: {
      label: 'Available',
      bgLight: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: CheckCircle2,
    },
  };

  const _status = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig.COLLECTING;

  const handleContribute = async () => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Minimum contribution is $1',
      });
      return;
    }

    setIsContributing(true);
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id, amount }),
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: 'Contribution Successful!',
          description: result.message,
        });
        onMutate();
        setContributionAmount('1');
      } else {
        const error = await res.json();
        toast({
          variant: 'destructive',
          title: 'Contribution Failed',
          description: error.error || 'Failed to contribute',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process contribution',
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    setIsPurchasing(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      if (res.ok) {
        toast({
          title: 'Purchase Successful!',
          description: 'You now have access to this asset',
        });
        onMutate();
      } else {
        const error = await res.json();
        toast({
          variant: 'destructive',
          title: 'Purchase Failed',
          description: error.error || 'Failed to purchase',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process purchase',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-purple-600/10 backdrop-blur-sm">
      <CardContent className="p-6 space-y-6">
        {/* Price */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {asset.status === 'COLLECTING'
              ? 'Funding Goal'
              : asset.status === 'AVAILABLE'
                ? 'Price'
                : 'Status'}
          </p>
          <p className="text-4xl font-bold text-gradient">
            {asset.status === 'COLLECTING'
              ? `$${targetWithFee.toFixed(2)}`
              : asset.status === 'AVAILABLE'
                ? '$1.00'
                : 'Processing'}
          </p>
        </div>

        {/* Progress Bar for COLLECTING */}
        {asset.status === 'COLLECTING' && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                ${prismaDecimalToNumber(asset.currentCollected).toFixed(2)} collected
              </span>
              <span className="font-semibold">{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            {remainingAmount > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                ${remainingAmount.toFixed(2)} remaining to fund
              </p>
            )}
          </div>
        )}

        {/* Contributors Count */}
        <div className="flex items-center justify-center gap-2 text-sm py-3 border-y">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{contributionsCount} contributors</span>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium">{asset.totalPurchases} purchases</span>
        </div>

        {/* Action Buttons */}
        {!hasAccess && (
          <div className="space-y-3">
            {asset.status === 'COLLECTING' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Contribution Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Min $1. Contribute more to earn profit share!
                  </p>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold h-12"
                  onClick={handleContribute}
                  disabled={isContributing}
                  size="lg"
                >
                  {isContributing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Contributing...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Contribute ${parseFloat(contributionAmount || '1').toFixed(2)}
                    </>
                  )}
                </Button>
              </>
            )}

            {asset.status === 'AVAILABLE' && (
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold h-12"
                onClick={handlePurchase}
                disabled={isPurchasing}
                size="lg"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy for $1.00
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Payment Summary */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {asset.status === 'COLLECTING' ? 'Your contribution' : 'Purchase price'}
            </span>
            <span className="font-medium">
              {asset.status === 'COLLECTING'
                ? `$${parseFloat(contributionAmount || '1').toFixed(2)}`
                : '$1.00'}
            </span>
          </div>
          {asset.status === 'COLLECTING' &&
            parseFloat(contributionAmount || '1') >
            asset.targetPrice / contributionsCount && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Potential investment</span>
              <span className="font-medium">
                $
                {Math.max(
                  0,
                  parseFloat(contributionAmount || '1') -
                    asset.targetPrice / Math.max(contributionsCount, 1)
                ).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
