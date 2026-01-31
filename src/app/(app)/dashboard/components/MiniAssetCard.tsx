'use client';

import { Package, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { Asset } from '../types';

/**
 * Mini Asset Card - Premium Dark Theme
 *
 * Features:
 * - Strict flex-col layout
 * - Image area (60%) with gradient overlay
 * - Content area (40%) with solid zinc-950 background
 * - Thin neon purple progress bar (2px)
 * - Truncated title (1 line)
 */
export function MiniAssetCard({ asset }: { asset: Asset }) {
  const progressPercent = Math.min(
    (asset.currentCollected / (asset.targetPrice * (1 + asset.platformFee))) * 100,
    100
  );

  return (
    <Link href={`/assets/${asset.id}`} className="block group h-full">
      <div className="flex flex-col border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden hover:border-zinc-700 transition-all duration-300 h-full shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        {/* Image Area - 60% */}
        <div className="relative aspect-video overflow-hidden flex-shrink-0">
          {asset.thumbnail ? (
            <>
              <Image
                src={asset.thumbnail}
                alt={asset.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Strong gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Package className="w-10 h-10 text-zinc-700" />
            </div>
          )}

          {/* Status Badge - positioned in overlay */}
          <div className="absolute top-2 right-2">
            <Badge
              className={`${
                asset.status === 'COLLECTING'
                  ? 'bg-violet-600/90 text-white border-0'
                  : 'bg-emerald-600/90 text-white border-0'
              } backdrop-blur-sm text-xs`}
            >
              {asset.status === 'COLLECTING' ? 'Funding' : 'Available'}
            </Badge>
          </div>
        </div>

        {/* Content Area - 40% */}
        <div className="p-3 flex-shrink-0 bg-zinc-950">
          {/* Title - truncated to 1 line */}
          <h3 className="font-semibold text-sm text-zinc-100 truncate mb-2 group-hover:text-white transition-colors">
            {asset.title}
          </h3>

          {/* Metadata row */}
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">
              {asset.type}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Users className="w-3 h-3" />
              {asset.totalPurchases}
            </span>
          </div>

          {/* Funding Progress */}
          {asset.status === 'COLLECTING' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">{progressPercent.toFixed(0)}% funded</span>
                <span className="font-medium text-zinc-300">${prismaDecimalToNumber(asset.currentCollected).toFixed(0)}</span>
              </div>
              {/* Thin neon purple progress bar (2px) */}
              <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
