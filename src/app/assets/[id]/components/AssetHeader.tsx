'use client';

import { CheckCircle2, Clock, Eye, ExternalLink, Package, Star } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Asset } from '../types';

interface AssetHeaderProps {
  asset: Asset;
  hasAccess: boolean;
  contributionsCount: number;
}

export function AssetHeader({ asset, hasAccess, contributionsCount }: AssetHeaderProps) {
  const statusConfig = {
    COLLECTING: {
      label: 'Funding',
      color: 'bg-blue-500',
      bgLight: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      icon: Clock,
    },
    PURCHASED: {
      label: 'Processing',
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: Clock,
    },
    AVAILABLE: {
      label: 'Available',
      color: 'bg-green-500',
      bgLight: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: CheckCircle2,
    },
  };

  const status = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig.COLLECTING;
  const StatusIcon = status.icon;

  return (
    <Card className="border-2 overflow-hidden">
      <div className="relative aspect-video overflow-hidden group">
        {asset.thumbnail ? (
          <Image
            src={asset.thumbnail}
            alt={asset.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center rounded-2xl">
            <Package className="w-16 h-16 text-slate-400" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="backdrop-blur-sm bg-white/90 dark:bg-black/90">
            {asset.type}
          </Badge>
          <Badge className={`${status.bgLight} ${status.text} backdrop-blur-sm`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
          {hasAccess && (
            <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              You Own This
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 text-gradient">{asset.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {asset.totalPurchases + contributionsCount} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Featured Asset
              </span>
            </div>
          </div>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {asset.description}
        </p>
      </CardContent>
    </Card>
  );
}
