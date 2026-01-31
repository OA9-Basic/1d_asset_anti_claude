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
 * Split into TWO distinct sections:
 * 1. TOP: Image area (aspect-video) with status badge
 * 2. BOTTOM: Content area with solid background
 *
 * Text is NEVER overlaid on image.
 */
export function MiniAssetCard({ asset }: { asset: Asset }) {
  const progressPercent = Math.min(
    (asset.currentCollected / (asset.targetPrice * (1 + asset.platformFee))) * 100,
    100
  );

  return (
    <Link href={`/assets/${asset.id}`} className="block group h-full">
      <div className="flex flex-col border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden hover:border-zinc-700 transition-all duration-300 h-full">
        {/* TOP SECTION: Image Only */}
        <div className="relative aspect-video overflow-hidden bg-zinc-900">
          {asset.thumbnail ? (
            <Image
              src={asset.thumbnail}
              alt={asset.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-zinc-800" />
            </div>
          )}

          {/* Status Badge - positioned in image area */}
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

        {/* BOTTOM SECTION: Content Only */}
        <div className="p-4 bg-zinc-950 flex-1 flex flex-col">
          {/* Title - NOT overlaid, below image */}
          <h3 className="font-semibold text-sm text-zinc-100 truncate mb-3 group-hover:text-white transition-colors">
            {asset.title}
          </h3>

          {/* Metadata row */}
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">
              {asset.type}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Users className="w-3 h-3" />
              {asset.totalPurchases}
            </span>
          </div>

          {/* Funding Progress - at bottom */}
          {asset.status === 'COLLECTING' && (
            <div className="mt-auto space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-500">{progressPercent.toFixed(0)}% funded</span>
                <span className="font-medium text-zinc-300">${prismaDecimalToNumber(asset.currentCollected).toFixed(0)}</span>
              </div>
              {/* Thin neon purple progress bar */}
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
