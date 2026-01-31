'use client';

import { CheckCircle2, Clock, DollarSign, ShoppingCart, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { Asset } from '../types';


interface QuickStatsProps {
  asset: Asset;
  contributionsCount: number;
}

export function QuickStats({ asset, contributionsCount }: QuickStatsProps) {
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

  const status = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig.COLLECTING;
  const StatusIcon = status.icon;

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Contributors</span>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">{contributionsCount}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Purchases</span>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">{asset.totalPurchases}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Revenue</span>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">
              ${prismaDecimalToNumber(asset.totalRevenue).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge className={`${status.bgLight} ${status.text}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
