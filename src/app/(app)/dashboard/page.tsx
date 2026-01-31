'use client';

import {
  AlertCircle,
  ArrowUpRight,
  Loader2,
  PlusCircle,
  RefreshCw,
  Share2,
  ShoppingCart,
  TrendingUp,
  Users,
  Vote,
  Wallet,
  Package,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'
import useSWR from 'swr';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderContent, PageTitle, PageDescription } from '@/components/ui/unified';
import { StatCard } from '@/components/ui/unified/stat-card';
import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';
import { useAuth } from '@/hooks/use-auth';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStats {
  totalContributed: number;
  activeVotes: number;
  assetsOwned: number;
  walletBalance: number;
  withdrawableBalance: number;
  storeCredit: number;
}

interface Contribution {
  id: string;
  amount: number;
  assetId: string;
  createdAt: string;
  asset: {
    id: string;
    title: string;
    thumbnail: string | null;
    type: string;
    status: string;
  };
}

interface ActivityItem {
  id: string;
  type: string;
  amount: number;
  user: {
    id: string;
    name: string;
  };
  asset: {
    id: string;
    title: string;
    type: string;
    thumbnail: string | null;
  };
  createdAt: string;
}

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  deliveryType: string;
  targetPrice: number;
  platformFee: number;
  currentCollected: number;
  status: string;
  totalPurchases: number;
  totalRevenue: number;
  thumbnail: string | null;
  featured: boolean;
}

interface Purchase {
  id: string;
  amount: number;
  createdAt: string;
  asset: {
    id: string;
    title: string;
    thumbnail: string | null;
  };
}

interface DashboardData {
  stats: DashboardStats;
  contributions: Contribution[];
  purchases: Purchase[];
  recentActivity: ActivityItem[];
  votes: Vote[];
}

interface FeaturedAssetsData {
  assets: Asset[];
}

interface Vote {
  id: string;
  assetRequest: {
    id: string;
    title: string;
  };
  voteType: string;
  createdAt: string;
}

// ============================================================================
// ACTIVITY FEED ITEM
// ============================================================================

function ActivityItem({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer">
      <Avatar className="h-8 w-8 border-2 border-background">
        <AvatarFallback className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs">
          {item.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{item.user.name}</span>
          <span className="text-neutral-500 dark:text-neutral-400"> contributed </span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            ${prismaDecimalToNumber(item.amount).toFixed(0)}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400"> to </span>
          <span className="font-medium">{item.asset.title}</span>
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        {item.asset.type}
      </Badge>
    </div>
  );
}

// ============================================================================
// MINI ASSET CARD
// ============================================================================

function MiniAssetCard({ asset }: { asset: Asset }) {
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

// ============================================================================
// DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
    mutate: mutateDashboard,
  } = useSWR<DashboardData>(user ? '/api/dashboard' : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const { data: featuredData, isLoading: featuredLoading } = useSWR<FeaturedAssetsData>(
    '/api/assets/featured?trending=true&limit=6',
    fetcher
  );

  const { data: activityData, isLoading: activityLoading } = useSWR<{ activity: ActivityItem[] }>(
    '/api/activity?limit=8',
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center justify-between">
            <div>
              <PageTitle>
                Welcome back, {user.firstName || user.name || user.email?.split('@')[0]}!
              </PageTitle>
              <PageDescription>
                Here&apos;s what&apos;s happening with your account
              </PageDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutateDashboard()}
              disabled={dashboardLoading}
              className="border-neutral-200 dark:border-neutral-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        {dashboardLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-black p-6 animate-pulse" />
            ))}
          </div>
        ) : dashboardError ? (
          <UnifiedCard variant="default" className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Failed to load dashboard data</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mutateDashboard()}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </UnifiedCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Wallet}
              title="Total Contributed"
              value={`$${prismaDecimalToNumber(dashboardData?.stats.totalContributed).toFixed(0) || '0'}`}
              description="Lifetime contributions"
              variant="default"
            />
            <StatCard
              icon={Vote}
              title="Active Votes"
              value={dashboardData?.stats.activeVotes || 0}
              description="Asset requests you've voted on"
              variant="info"
            />
            <StatCard
              icon={Package}
              title="Assets Owned"
              value={dashboardData?.stats.assetsOwned || 0}
              description="Assets you have access to"
              variant="primary"
            />
            <StatCard
              icon={TrendingUp}
              title="Wallet Balance"
              value={`$${prismaDecimalToNumber(dashboardData?.stats.walletBalance).toFixed(2) || '0'}`}
              description="Available to spend"
              variant="success"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recent Activity</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    See what the community is contributing to
                  </p>
                </div>
              </div>

              <UnifiedCard variant="default" padding="none">
                <CardHeader bordered>
                  <CardTitle className="text-lg">Community Contributions</CardTitle>
                  <CardDescription>Real-time updates from across the platform</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {activityLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded" />
                            <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activityData?.activity && activityData.activity.length > 0 ? (
                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {activityData.activity.map((item) => (
                        <ActivityItem key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity yet</p>
                      <p className="text-sm">Be the first to contribute!</p>
                    </div>
                  )}
                </CardContent>
              </UnifiedCard>
            </div>

            {/* Trending Assets */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Trending Assets</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Popular assets getting funded right now
                  </p>
                </div>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm" className="border-neutral-200 dark:border-neutral-800">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-black p-4 animate-pulse" />
                  ))
                ) : featuredData?.assets && featuredData.assets.length > 0 ? (
                  featuredData.assets.map((asset) => <MiniAssetCard key={asset.id} asset={asset} />)
                ) : (
                  <UnifiedCard className="col-span-full" padding="lg">
                    <CardContent className="text-center text-neutral-500 dark:text-neutral-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No trending assets available</p>
                    </CardContent>
                  </UnifiedCard>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & My Contributions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <UnifiedCard variant="default" padding="md">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with these options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Link href="/request" className="block">
                  <Button className="w-full justify-start bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Request an Asset
                  </Button>
                </Link>
                <Link href="/marketplace" className="block">
                  <Button variant="outline" className="w-full justify-start border-neutral-200 dark:border-neutral-800">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
                <Link href="/wallet" className="block">
                  <Button variant="outline" className="w-full justify-start border-neutral-200 dark:border-neutral-800">
                    <Wallet className="w-4 h-4 mr-2" />
                    Manage Wallet
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full justify-start border-neutral-200 dark:border-neutral-800"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}?ref=${user.id}`);
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
              </CardContent>
            </UnifiedCard>

            {/* My Contributions */}
            <UnifiedCard variant="default" padding="md">
              <CardHeader>
                <CardTitle className="text-lg">My Contributions</CardTitle>
                <CardDescription>Assets you&apos;re helping fund</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {dashboardLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : dashboardData?.contributions && dashboardData.contributions.length > 0 ? (
                  <>
                    {dashboardData.contributions.slice(0, 4).map((contribution) => (
                      <Link
                        key={contribution.id}
                        href={`/assets/${contribution.assetId}`}
                        className="block group"
                      >
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                          {contribution.asset.thumbnail ? (
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <Image
                                src={contribution.asset.thumbnail}
                                alt={contribution.asset.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                              <Package className="w-6 h-6 text-neutral-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                              {contribution.asset.title}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              ${prismaDecimalToNumber(contribution.amount).toFixed(0)} contributed
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {contribution.asset.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                    {dashboardData.contributions.length > 4 && (
                      <Link href="/wallet">
                        <Button variant="ghost" size="sm" className="w-full">
                          View all contributions
                          <ArrowUpRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                    <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No contributions yet</p>
                    <Link href="/marketplace">
                      <Button size="sm" variant="outline" className="mt-3 border-neutral-200 dark:border-neutral-800">
                        Start Contributing
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </UnifiedCard>

            {/* Balance Breakdown */}
            {dashboardData?.stats && (
              <UnifiedCard variant="default" padding="md">
                <CardHeader>
                  <CardTitle className="text-lg">Balance Breakdown</CardTitle>
                  <CardDescription>Your wallet at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Available Balance</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      ${prismaDecimalToNumber(dashboardData.stats.walletBalance).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Withdrawable</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${prismaDecimalToNumber(dashboardData.stats.withdrawableBalance).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Store Credit</span>
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                      ${prismaDecimalToNumber(dashboardData.stats.storeCredit).toFixed(2)}
                    </span>
                  </div>
                  <Link href="/wallet/deposit">
                    <Button className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90">
                      <Wallet className="w-4 h-4 mr-2" />
                      Add Funds
                    </Button>
                  </Link>
                </CardContent>
              </UnifiedCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
