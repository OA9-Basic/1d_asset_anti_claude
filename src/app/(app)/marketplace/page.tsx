'use client';

import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Package,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';

import { Badge } from '@/components/ui/badge';
import { PageHeader, PageHeaderContent, PageTitle, PageDescription } from '@/components/ui/unified';
import { StatCard } from '@/components/ui/unified/stat-card';
import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  thumbnail: string | null;
  targetPrice: number;
  currentCollected: number;
  totalPurchases: number;
  featured: boolean;
}

interface FeaturedAssetsData {
  assets: Asset[];
}

// ============================================================================
// FEATURED ASSET CARD
// ============================================================================

function FeaturedAssetCard({ asset }: { asset: Asset }) {
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
          {asset.featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-amber-500/90 text-white border-0 shadow-md">
                <Sparkles className="w-3 h-3 mr-1 fill-white" />
                Featured
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
            {asset.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <Badge variant="outline" className="text-xs">
              {asset.type}
            </Badge>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {asset.totalPurchases}
            </span>
          </div>
        </CardContent>
      </div>
    </Link>
  );
}

// ============================================================================
// MARKETPLACE PAGE
// ============================================================================

export default function MarketplacePage() {
  const { data: featuredData, isLoading: featuredLoading } = useSWR<FeaturedAssetsData>(
    '/api/assets/featured?limit=6',
    fetcher
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <PageHeader>
        <PageHeaderContent>
          <div>
            <PageTitle>Marketplace</PageTitle>
            <PageDescription>
              Discover, fund, and access premium digital assets
            </PageDescription>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            title="Total Assets"
            value={featuredData?.assets?.length || 0}
            description="Available assets"
            variant="default"
          />
          <StatCard
            icon={Users}
            title="Active Funders"
            value="1,200+"
            description="Community members"
            variant="info"
          />
          <StatCard
            icon={DollarSign}
            title="Total Funded"
            value="$50K+"
            description="Contributed to assets"
            variant="success"
          />
          <StatCard
            icon={Zap}
            title="Success Rate"
            value="95%"
            description="Assets fully funded"
            variant="warning"
          />
        </div>

        {/* Marketplace Categories */}
        <UnifiedCard variant="default" padding="md">
          <CardHeader>
            <CardTitle className="text-2xl">Browse Marketplace</CardTitle>
            <CardDescription>Choose a category to explore available assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {/* Available Assets */}
            <Link href="/marketplace/available" className="block group">
              <div className="flex items-center justify-between p-6 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black hover:border-neutral-900 dark:hover:border-white transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      Available Assets
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                      Instantly access fully funded assets for just $1
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Funding Assets */}
            <Link href="/marketplace/funding" className="block group">
              <div className="flex items-center justify-between p-6 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black hover:border-neutral-900 dark:hover:border-white transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      Funding Campaigns
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                      Contribute to upcoming assets and share in profits
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </CardContent>
        </UnifiedCard>

        {/* Featured Assets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Featured Assets</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Hand-picked assets from our community
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-black p-4 animate-pulse" />
              ))
            ) : featuredData?.assets && featuredData.assets.length > 0 ? (
              featuredData.assets.map((asset) => <FeaturedAssetCard key={asset.id} asset={asset} />)
            ) : (
              <UnifiedCard className="col-span-full" padding="lg">
                <CardContent className="text-center text-neutral-500 dark:text-neutral-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No featured assets available</p>
                </CardContent>
              </UnifiedCard>
            )}
          </div>
        </div>

        {/* How It Works */}
        <UnifiedCard variant="default" padding="md">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
            <CardDescription>Simple steps to get started with our marketplace</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="font-semibold mb-2 text-neutral-900 dark:text-white">1. Browse Assets</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Explore our collection of courses, AI models, software, and more
                </p>
              </div>
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="font-semibold mb-2 text-neutral-900 dark:text-white">2. Fund or Purchase</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Contribute to funding campaigns or buy available assets for $1
                </p>
              </div>
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="font-semibold mb-2 text-neutral-900 dark:text-white">3. Get Access</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Instantly access your purchased assets or earn profits from contributions
                </p>
              </div>
            </div>
          </CardContent>
        </UnifiedCard>
      </div>
    </div>
  );
}
