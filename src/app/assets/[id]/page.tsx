'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

import { AssetHeader } from './components/AssetHeader';
import { AssetDetails } from './components/AssetDetails';
import { WhyThisAsset } from './components/WhyThisAsset';
import { ActionCard } from './components/ActionCard';
import { QuickStats } from './components/QuickStats';
import { InvestmentInfo } from './components/InvestmentInfo';
import { AssetTabs } from './components/AssetTabs';
import { RelatedAssets } from './components/RelatedAssets';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { Breadcrumb } from './components/Breadcrumb';
import { ShareButton } from './components/ShareButton';
import type { AssetData, RelatedAsset } from './types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AssetDetailPage() {
  const params = useParams();
  const [retryCount, setRetryCount] = useState(0);

  const assetId = params.id as string;

  const { data, error, isLoading, mutate } = useSWR<AssetData>(`/api/assets/${assetId}`, fetcher);

  // Fetch related assets
  const { data: relatedData } = useSWR<{ assets: RelatedAsset[] }>(
    `/api/assets/related?assetId=${assetId}&limit=4`,
    fetcher
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return <ErrorState onRetry={() => setRetryCount((prev) => prev + 1)} />;
  }

  const {
    asset,
    contributions,
    purchases,
    userContribution,
    hasAccess,
  } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-white dark:bg-black"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Share */}
          <div className="flex items-center justify-between mb-6">
            <Breadcrumb assetId={assetId} />
            <ShareButton assetId={assetId} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (65%) - Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <AssetHeader
                asset={asset}
                hasAccess={hasAccess}
                contributionsCount={contributions.length}
              />

              <WhyThisAsset contributionsCount={contributions.length} />

              <AssetDetails asset={asset} hasAccess={hasAccess} />

              <AssetTabs
                asset={asset}
                contributions={contributions}
                purchases={purchases}
              />
            </motion.div>

            {/* Right Column (35%) - Sticky Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <ActionCard
                  asset={asset}
                  hasAccess={hasAccess}
                  contributionsCount={contributions.length}
                  userContribution={userContribution}
                  onMutate={mutate}
                />

                {userContribution && userContribution.excessAmount > 0 && (
                  <InvestmentInfo userContribution={userContribution} />
                )}

                <QuickStats
                  asset={asset}
                  contributionsCount={contributions.length}
                />
              </div>
            </motion.div>
          </div>

          {/* Related Assets */}
          {relatedData?.assets && relatedData.assets.length > 0 && (
            <motion.div variants={itemVariants}>
              <RelatedAssets assets={relatedData.assets} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
