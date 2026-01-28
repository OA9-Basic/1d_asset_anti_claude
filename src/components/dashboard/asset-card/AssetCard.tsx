/**
 * Asset Card Component (Refactored)
 *
 * Main card component for displaying assets in the dashboard
 * Uses smaller, focused sub-components for better maintainability
 */

'use client';

import { Asset } from '@prisma/client';
import { motion, Variants } from 'framer-motion';
import { Users, Star, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';
import { cn } from '@/lib/utils';

import {
  AssetStatusBadge,
  FundingProgress,
  AssetActionButton,
  AssetCardImage,
} from './index';

export interface AssetCardProps {
  asset: Asset & {
    _count?: {
      pledges: number;
    };
  };
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export const AssetCard = memo(function AssetCard({ asset }: AssetCardProps) {
  const targetPrice = prismaDecimalToNumber(asset.targetPrice);
  const currentCollected = prismaDecimalToNumber(asset.currentCollected);
  // Note: platformFee reserved for future use (e.g., displaying fee breakdown)
  const _platformFee = prismaDecimalToNumber(asset.platformFee) || 0.15;

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover={{ y: -4 }}>
      <Link href={`/assets/${asset.id}`} className="block">
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-900 group">
          {/* Image */}
          <AssetCardImage
            src={asset.thumbnail}
            alt={asset.title}
            type={asset.type}
          />

          {/* Content */}
          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {asset.title}
                </h3>
                <AssetStatusBadge status={asset.status} />
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {asset.description}
              </p>
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium',
                  String(asset.type) === 'VIDEO' &&
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                  String(asset.type) === 'AUDIO' &&
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                  String(asset.type) === 'IMAGE' &&
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                  String(asset.type) === 'DOCUMENT' &&
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                )}
              >
                {String(asset.type).toLowerCase()}
              </span>

              {asset.featured && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <DollarSign className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Price</p>
                <p className="text-sm font-semibold">${targetPrice.toFixed(2)}</p>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Users className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Backers</p>
                <p className="text-sm font-semibold">{asset._count?.pledges || 0}</p>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <TrendingUp className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Raised</p>
                <p className="text-sm font-semibold">${currentCollected.toFixed(2)}</p>
              </div>
            </div>

            {/* Progress Bar (for COLLECTING status) */}
            {asset.status === 'COLLECTING' && (
              <FundingProgress
                currentCollected={asset.currentCollected}
                targetPrice={asset.targetPrice}
                platformFee={asset.platformFee}
              />
            )}

            {/* Action Button */}
            <div className="pt-2">
              <AssetActionButton
                assetId={asset.id}
                status={asset.status}
                title={asset.title}
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
});
