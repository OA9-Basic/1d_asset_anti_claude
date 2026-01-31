'use client';

import { Package, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/unified/unified-card';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { Asset } from '../types';

export function MiniAssetCard({ asset }: { asset: Asset }) {
  const progressPercent = Math.min(
    (asset.currentCollected / (asset.targetPrice * (1 + asset.platformFee))) * 100,
    100
  );

  return (
    <Link href={`/assets/${asset.id}`} className="block group">
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-black overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 h-full">
        <div className="relative aspect-video overflow-hidden">
          {asset.thumbnail ? (
            <Image
              src={asset.thumbnail}
              alt={asset.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              <Package className="w-8 h-8 text-neutral-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              className={`${
                asset.status === 'COLLECTING'
                  ? 'bg-blue-500/90 text-white'
                  : 'bg-emerald-500/90 text-white'
              } backdrop-blur-sm border-0`}
            >
              {asset.status === 'COLLECTING' ? 'Funding' : 'Available'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
            {asset.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
            <Badge variant="outline" className="text-xs">
              {asset.type}
            </Badge>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {asset.totalPurchases}
            </span>
          </div>
          {asset.status === 'COLLECTING' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">{progressPercent.toFixed(0)}% funded</span>
                <span className="font-medium">${prismaDecimalToNumber(asset.currentCollected).toFixed(0)}</span>
              </div>
              <div className="h-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 dark:bg-white transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Link>
  );
}
