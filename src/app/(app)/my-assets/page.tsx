'use client';

import { motion } from 'framer-motion';
import { RefreshCw, ArrowUpRight, ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedCard, CardContent } from '@/components/ui/unified/unified-card';
import { useAuth } from '@/hooks/use-auth';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import { MyAssetCard } from './components/MyAssetCard';
import { AssetCardSkeleton, EmptyState } from './components/SkeletonStates';
import { StatCard } from './components/StatCard';
import type { MyAssetsData } from './types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MyAssetsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const {
    data: assetsData,
    error: assetsError,
    isLoading: assetsLoading,
    mutate: mutateAssets,
  } = useSWR<MyAssetsData>(user ? `/api/my-assets?filter=${activeTab}` : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-black"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
                My Assets
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Manage your contributions and owned assets
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutateAssets()}
              disabled={assetsLoading}
              className="border-zinc-200 dark:border-zinc-800"
            >
              <motion.div
                animate={assetsLoading ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
              </motion.div>
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {assetsError ? (
          <UnifiedCard variant="default" padding="lg" className="border-red-900/50 bg-red-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-400">
                <RefreshCw className="w-5 h-5" />
                <div>
                  <p className="font-medium text-zinc-100">Failed to load assets</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mutateAssets()}
                    className="mt-2 border-zinc-800"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </UnifiedCard>
        ) : (
          <>
            {assetsData?.stats && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={ShoppingCart}
                    title="Total Invested"
                    value={`$${prismaDecimalToNumber(assetsData.stats.totalInvested).toFixed(2)}`}
                    description="Lifetime contributions"
                    variant="default"
                  />
                  <StatCard
                    icon={Package}
                    title="Contributing"
                    value={assetsData.stats.contributingCount}
                    description="Assets funding now"
                    variant="info"
                  />
                  <StatCard
                    icon={ShoppingCart}
                    title="Owned"
                    value={assetsData.stats.ownedCount}
                    description="Assets you own"
                    variant="success"
                  />
                  <StatCard
                    icon={Package}
                    title="Completed"
                    value={assetsData.stats.completedCount}
                    description="Successfully funded"
                    variant="primary"
                  />
                </div>
              </motion.section>
            )}

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="contributing">
                      Contributing ({assetsData?.stats.contributingCount || 0})
                    </TabsTrigger>
                    <TabsTrigger value="owned">
                      Owned ({assetsData?.stats.ownedCount || 0})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({assetsData?.stats.completedCount || 0})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Link href="/marketplace">
                  <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-800">
                    Browse More Assets
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {assetsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <AssetCardSkeleton key={i} />
                  ))}
                </div>
              ) : assetsData?.assets && assetsData.assets.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {assetsData.assets.map((asset) => (
                    <MyAssetCard key={asset.id} asset={asset} />
                  ))}
                </motion.div>
              ) : (
                <EmptyState activeTab={activeTab} />
              )}
            </section>
          </>
        )}
      </div>
    </motion.div>
  );
}
