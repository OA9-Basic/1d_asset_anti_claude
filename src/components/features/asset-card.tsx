'use client';

import { Asset, AssetStatus, AssetType, DeliveryType } from '@prisma/client';
import { Wallet, CheckCircle2, Clock, Users, ShoppingCart, TrendingUp, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, memo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';

type AssetCardAsset = Omit<Asset, 'contributions' | 'assetPurchases' | 'profitShares' | 'request'> | {
  id: string;
  status: AssetStatus | string;
  title: string;
  description: string;
  type: AssetType | string;
  deliveryType?: DeliveryType | string;
  targetPrice: number;
  platformFee?: number;
  currentCollected: number;
  totalPurchases: number;
  totalRevenue: number;
  thumbnail: string | null;
  featured: boolean;
  createdAt: Date | string;
  availableAt?: Date | string | null;
  purchasedAt?: Date | string | null;
  updatedAt?: Date | string;
  sourceUrl?: string | null;
  metadata?: unknown;
  deliveryUrl?: string | null;
  deliveryKey?: string | null;
  streamUrl?: string | null;
  externalAccessUrl?: string | null;
  externalCredentials?: unknown;
  approvedAt?: Date | string | null;
  votingStartsAt?: Date | string | null;
  votingEndsAt?: Date | string | null;
  totalProfitDistributed?: number;
  slug?: string;
} & {
  _count?: {
    pledges?: number;
  };
};

interface AssetCardProps {
  asset: AssetCardAsset;
}

const statusConfig: Record<string, {
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  icon: typeof Clock;
  className: string;
}> = {
  REQUESTED: {
    label: 'Requested',
    variant: 'secondary',
    icon: Clock,
    className: 'status-requested',
  },
  APPROVED: {
    label: 'Approved',
    variant: 'default',
    icon: CheckCircle2,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  COLLECTING: {
    label: 'Funding',
    variant: 'default',
    icon: Clock,
    className: 'status-collecting',
  },
  PURCHASED: {
    label: 'Purchased',
    variant: 'outline',
    icon: CheckCircle2,
    className: 'status-purchased',
  },
  AVAILABLE: {
    label: 'Available',
    variant: 'default',
    icon: ShoppingCart,
    className: 'status-available',
  },
  PAUSED: {
    label: 'Paused',
    variant: 'destructive',
    icon: Clock,
    className: 'status-rejected',
  },
  REJECTED: {
    label: 'Rejected',
    variant: 'destructive',
    icon: Clock,
    className: 'status-rejected',
  },
};

export const AssetCard = memo(function AssetCard({ asset }: AssetCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const statusInfo = statusConfig[asset.status] || statusConfig.REQUESTED;
  const StatusIcon = statusInfo.icon;

  // Calculate progress including platform fee
  const platformFee = asset.platformFee || 0.15;
  const targetWithFee = asset.targetPrice * (1 + platformFee);
  const progressPercent = Math.min((Number(asset.currentCollected) / targetWithFee) * 100, 100);
  const remainingAmount = Math.max(targetWithFee - Number(asset.currentCollected), 0);

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (asset.status === 'COLLECTING') {
      router.push(`/assets/${asset.id}`);
    } else if (asset.status === 'AVAILABLE' || asset.status === 'PURCHASED') {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/assets/${asset.id}/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 1 }),
        });

        if (res.ok) {
          router.push(`/assets/${asset.id}?access=true`);
        } else {
          const data = await res.json();
          console.error('Purchase failed:', data.error);
        }
      } catch (error) {
        console.error('Purchase error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getActionButton = () => {
    switch (asset.status) {
      case 'COLLECTING':
        return (
          <Button
            className="w-full h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-md button-glow"
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Contribute Now
              </>
            )}
          </Button>
        );
      case 'AVAILABLE':
      case 'PURCHASED':
        return (
          <Button
            className="w-full h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md button-glow"
            onClick={handleAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Get for $1
              </>
            )}
          </Button>
        );
      default:
        return (
          <Button className="w-full h-10" variant="outline" disabled>
            {statusInfo.label}
          </Button>
        );
    }
  };

  return (
    <Link href={`/assets/${asset.id}`} className="block group">
      <Card className="overflow-hidden border-2 card-hover h-full flex flex-col">
        {/* Image Section */}
        <CardHeader className="p-0 relative">
          {asset.thumbnail ? (
            <div className="relative overflow-hidden w-full h-52">
              <Image
                src={asset.thumbnail}
                alt={asset.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              <Users className="w-16 h-16 text-slate-400" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${statusInfo.className} backdrop-blur-sm border-0`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Featured Badge */}
          {asset.featured && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-md">
                <Star className="w-3 h-3 mr-1 fill-white" />
                Featured
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-5 space-y-4 flex-1">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {asset.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {asset.type}
              </Badge>
              {asset.deliveryType && (
                <span className="text-xs text-muted-foreground">{asset.deliveryType}</span>
              )}
            </div>
          </div>

          {/* Progress for COLLECTING status */}
          {asset.status === 'COLLECTING' && (
            <div className="space-y-3 p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Raised</span>
                <span className="font-bold text-lg text-gradient">
                  ${asset.currentCollected.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Goal</span>
                <span className="font-medium">${targetWithFee.toFixed(0)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-bold">{progressPercent.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5" />
                {remainingAmount > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ${remainingAmount.toFixed(0)} remaining to fund
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Available/Purchased status */}
          {(asset.status === 'AVAILABLE' || asset.status === 'PURCHASED') && (
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    {asset.status === 'AVAILABLE' ? 'Instant Access' : 'Fully Funded'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {asset.totalPurchases || 0} people have access
                  </p>
                </div>
              </div>
              {asset.status === 'AVAILABLE' && (
                <div className="pt-2 border-t border-green-200/50">
                  <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
                    Get instant access for just $1
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {asset.totalPurchases || 0}
              </span>
              {asset.totalRevenue > 0 && (
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-green-500" />${asset.totalRevenue.toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">{getActionButton()}</CardFooter>
      </Card>
    </Link>
  );
});
