'use client';

import { Loader2, RefreshCw, Users, Package, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { RequestAssetModal } from '@/components/dashboard/RequestAssetModal';
import { Button } from '@/components/ui/button';
import { PageHeader, PageHeaderContent, PageTitle, PageDescription } from '@/components/ui/unified';
import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';
import { useAuth } from '@/hooks/use-auth';

import { ActivityFeedItem } from './components/ActivityFeedItem';
import { BalanceBreakdown } from './components/BalanceBreakdown';
import { DashboardStats } from './components/DashboardStats';
import { MiniAssetCard } from './components/MiniAssetCard';
import { MyContributions } from './components/MyContributions';
import { QuickActions } from './components/QuickActions';
import type { DashboardData, FeaturedAssetsData, ActivityItem } from './types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [requestModalOpen, setRequestModalOpen] = useState(false);

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
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  const displayName = user.firstName || user.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Request Asset Modal */}
      <RequestAssetModal open={requestModalOpen} onOpenChange={setRequestModalOpen} />

      {/* Premium Header - Proper flex alignment */}
      <PageHeader className="pb-6">
        <PageHeaderContent>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <PageTitle className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
                Welcome back, {displayName}
              </PageTitle>
              <PageDescription className="mt-1">
                Here&apos;s what&apos;s happening with your account
              </PageDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutateDashboard()}
              disabled={dashboardLoading}
              className="border-zinc-200 dark:border-zinc-700 flex-shrink-0 ml-4"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <DashboardStats
          stats={dashboardData?.stats}
          loading={dashboardLoading}
          error={!!dashboardError}
          onRefresh={() => mutateDashboard()}
        />

        {/* Main Content Grid - 12-column: 8:4 ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Activity Feed (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Recent Activity - Timeline Style */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100 tracking-tight-premium">
                    Recent Activity
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Community contributions in real-time
                  </p>
                </div>
              </div>

              <UnifiedCard variant="default" padding="md" className="border-zinc-800/60 overflow-hidden">
                <CardHeader bordered className="px-6">
                  <CardTitle className="text-zinc-100">Community Contributions</CardTitle>
                  <CardDescription>Real-time updates from across the platform</CardDescription>
                </CardHeader>
                <CardContent className="px-6">
                  {activityLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium rounded" />
                            <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activityData?.activity && activityData.activity.length > 0 ? (
                    <div className="space-y-0 max-h-[400px] overflow-y-auto">
                      {activityData.activity.map((item, index) => (
                        <div key={item.id} className="relative">
                          {/* Timeline connector */}
                          {index < activityData.activity.length - 1 && (
                            <div className="absolute left-5 top-12 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
                          )}
                          <ActivityFeedItem item={item} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-zinc-700 rounded-lg">
                      <Users className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
                      <p className="text-sm text-zinc-500">No activity yet</p>
                    </div>
                  )}
                </CardContent>
              </UnifiedCard>
            </div>

            {/* Trending Assets */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100 tracking-tight-premium">
                    Trending Assets
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Popular assets getting funded right now
                  </p>
                </div>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm" className="border-zinc-200 dark:border-zinc-700">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium" />
                  ))
                ) : featuredData?.assets && featuredData.assets.length > 0 ? (
                  featuredData.assets.map((asset) => <MiniAssetCard key={asset.id} asset={asset} />)
                ) : (
                  <UnifiedCard className="col-span-full" padding="lg">
                    <CardContent className="text-center py-10">
                      <Package className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
                      <p className="text-sm text-zinc-500">No trending assets available</p>
                    </CardContent>
                  </UnifiedCard>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar (4 cols) - h-fit to prevent stretching */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-fit">
            <QuickActions userId={user.id} onRequestAssetOpen={() => setRequestModalOpen(true)} />
            <MyContributions contributions={dashboardData?.contributions} loading={dashboardLoading} />
            <BalanceBreakdown stats={dashboardData?.stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
