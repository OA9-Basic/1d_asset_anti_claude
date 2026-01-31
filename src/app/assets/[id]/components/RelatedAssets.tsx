'use client';

import { Package, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { RelatedAsset } from '../types';

export function RelatedAssetCard({ asset }: { asset: RelatedAsset }) {
  return (
    <Link href={`/assets/${asset.id}`} className="block group">
      <Card className="overflow-hidden border-2 card-hover h-full">
        <div className="relative aspect-video overflow-hidden">
          {asset.thumbnail ? (
            <Image
              src={asset.thumbnail}
              alt={asset.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {asset.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {asset.type}
            </Badge>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {asset.totalPurchases}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface RelatedAssetsProps {
  assets: RelatedAsset[];
}

export function RelatedAssets({ assets }: RelatedAssetsProps) {
  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Related Assets</h2>
        <p className="text-muted-foreground">
          You might also be interested in these assets
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <RelatedAssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
