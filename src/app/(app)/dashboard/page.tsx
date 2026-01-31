'use client';

import { Loader2, RefreshCw, Users, Package, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';

import { PageHeader, PageHeaderContent, PageTitle, PageDescription } from '@/components/ui/unified';
import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';
import { useAuth } from '@/hooks/use-auth';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import { DashboardStats } from './components/DashboardStats';
import { QuickActions } from './components/QuickActions';
import { MyContributions } from './components/MyContributions';
import { BalanceBreakdown } from './components/BalanceBreakdown';
import { ActivityFeedItem } from './components/ActivityFeedItem';
import { MiniAssetCard } from './components/MiniAssetCard';
import type { DashboardData, FeaturedAssetsData, ActivityItem } from './types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
        <DashboardStats
          stats={dashboardData?.stats}
          loading={dashboardLoading}
          error={!!dashboardError}
          onRefresh={() => mutateDashboard()}
        />

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
                        <ActivityFeedItem key={item.id} item={item} />
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
            <QuickActions userId={user.id} />
            <MyContributions contributions={dashboardData?.contributions} loading={dashboardLoading} />
            <BalanceBreakdown stats={dashboardData?.stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
