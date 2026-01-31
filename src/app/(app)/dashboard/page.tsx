'use client';

import { Loader2, RefreshCw, Users, Package, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';


import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
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
  const [dismissBanner, setDismissBanner] = useState(false);

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
      {/* Email Verification Banner */}
      {user && !user.emailVerified && !dismissBanner && (
        <EmailVerificationBanner
          email={user.email}
          onDismiss={() => setDismissBanner(true)}
        />
      )}

      {/* Premium Header */}
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-gradient-to-b from-violet-500 to-indigo-600 rounded-full" />
              <div>
                <PageTitle className="tracking-tight-premium">
                  Welcome back, {displayName}
                </PageTitle>
                <PageDescription>
                  Here&apos;s what&apos;s happening with your account
                </PageDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutateDashboard()}
              disabled={dashboardLoading}
              className="border-zinc-200 dark:border-zinc-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 stagger-reveal">
        {/* Stats Grid - with premium animations */}
        <DashboardStats
          stats={dashboardData?.stats}
          loading={dashboardLoading}
          error={!!dashboardError}
          onRefresh={() => mutateDashboard()}
        />

        {/* Main Content Grid - 2:1 ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Feed (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity - Timeline Style */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight-premium">
                    Recent Activity
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Community contributions in real-time
                  </p>
                </div>
              </div>

              <UnifiedCard variant="default" padding="none" className="overflow-hidden">
                <CardHeader bordered>
                  <CardTitle>Community Contributions</CardTitle>
                  <CardDescription>Real-time updates from across the platform</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
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
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                        <Users className="w-8 h-8 text-zinc-400" />
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium">No recent activity yet</p>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Be the first to contribute!</p>
                    </div>
                  )}
                </CardContent>
              </UnifiedCard>
            </div>

            {/* Trending Assets */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight-premium">
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
                    <CardContent className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                        <Package className="w-8 h-8 text-zinc-400" />
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 font-medium">No trending assets available</p>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Check back later for new opportunities</p>
                    </CardContent>
                  </UnifiedCard>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & My Contributions (1/3) */}
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
