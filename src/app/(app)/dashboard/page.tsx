'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Minus,
  PlusCircle,
  RefreshCw,
  Share2,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Vote,
  Wallet,
  Package,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import useSWR from 'swr';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import {
  buttonTap,
  hoverLift,
  listCascade,
  listItem,
  staggerContainer,
  staggerItem,
} from '@/lib/animations';
import type { IconType } from '@/types/ui';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// TypeScript Interfaces
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

interface Vote {
  id: string;
  assetRequest: {
    id: string;
    title: string;
  };
  voteType: string;
  createdAt: string;
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

// Stat Card Component with Sparkline
function StatCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  trendValue,
  data,
  delay,
}: {
  icon: IconType;
  title: string;
  value: string | number;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  data?: Array<{ value: number }>;
  delay?: number;
}) {
  const trendIcon = {
    up: <ArrowUpRight className="w-4 h-4 text-green-500" />,
    down: <ArrowDownRight className="w-4 h-4 text-red-500" />,
    neutral: <Minus className="w-4 h-4 text-muted-foreground" />,
  };

  const sparklineData = data || Array.from({ length: 7 }, () => Math.random() * 100);

  return (
    <motion.div variants={staggerItem} {...hoverLift} className="group">
      <Card className="border-2 card-hover overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow"
            >
              <Icon className="h-6 w-6" />
            </motion.div>
            {trend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (delay || 0) + 0.3 }}
                className="flex items-center gap-1 text-sm"
              >
                {trendIcon[trend]}
                <span
                  className={
                    trend === 'up'
                      ? 'text-green-500'
                      : trend === 'down'
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                  }
                >
                  {trendValue || '0%'}
                </span>
              </motion.div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <motion.p
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (delay || 0) + 0.2 }}
              className="text-3xl font-bold text-gradient"
            >
              {value}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>

          {/* Sparkline Chart */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (delay || 0) + 0.4 }}
            className="mt-4 h-16"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                  animationDuration={1000}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg px-2 py-1 shadow-lg">
                          <p className="text-sm font-medium">{payload[0].value.toFixed(0)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Activity Feed Item
function ActivityItem({ item, index }: { item: ActivityItem; index: number }) {
  return (
    <motion.div
      variants={listItem}
      whileHover={{ x: 4, backgroundColor: 'rgba(var(--muted) / 0.5)' }}
      className="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Avatar className="h-8 w-8 border-2 border-background">
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
            {item.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </motion.div>
      <div className="flex-1 min-w-0">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.1 }}
          className="text-sm"
        >
          <span className="font-medium">{item.user.name}</span>
          <span className="text-muted-foreground"> contributed </span>
          <motion.span
            initial={{ scale: 1.5, color: '#8b5cf6' }}
            animate={{ scale: 1, color: 'inherit' }}
            transition={{ delay: index * 0.05 + 0.2 }}
            className="font-semibold text-primary"
          >
            ${item.amount.toFixed(0)}
          </motion.span>
          <span className="text-muted-foreground"> to </span>
          <span className="font-medium">{item.asset.title}</span>
        </motion.p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        {item.asset.type}
      </Badge>
    </motion.div>
  );
}

// Simplified Asset Card for Carousel
function MiniAssetCard({ asset }: { asset: Asset }) {
  const progressPercent = Math.min(
    (asset.currentCollected / (asset.targetPrice * (1 + asset.platformFee))) * 100,
    100
  );

  return (
    <Link href={`/assets/${asset.id}`} className="block group">
      <Card className="overflow-hidden border-2 card-hover h-full">
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
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              className={`${
                asset.status === 'COLLECTING'
                  ? 'bg-blue-500/90 text-white'
                  : 'bg-green-500/90 text-white'
              } backdrop-blur-sm border-0`}
            >
              {asset.status === 'COLLECTING' ? 'Funding' : 'Available'}
            </Badge>
          </div>
          {asset.featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-md">
                <Sparkles className="w-3 h-3 mr-1 fill-white" />
                Featured
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {asset.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
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
                <span className="text-muted-foreground">{progressPercent.toFixed(0)}% funded</span>
                <span className="font-medium">${asset.currentCollected.toFixed(0)}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Loading Skeleton
function StatCardSkeleton() {
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-1" />
        <div className="h-3 w-40 bg-muted animate-pulse rounded" />
        <div className="mt-4 h-16 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Fetch dashboard data
  const {
    data: dashboardData,
    error: dashboardError,
    isLoading: dashboardLoading,
    mutate: mutateDashboard,
  } = useSWR<DashboardData>(user ? '/api/dashboard' : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  // Fetch featured/trending assets
  const { data: featuredData, isLoading: featuredLoading } = useSWR<FeaturedAssetsData>(
    '/api/assets/featured?trending=true&limit=6',
    fetcher
  );

  // Fetch global activity feed
  const { data: activityData, isLoading: activityLoading } = useSWR<{ activity: ActivityItem[] }>(
    '/api/activity?limit=8',
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-muted/20 to-background"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b bg-background/95 backdrop-blur sticky top-0 z-10"
      >
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold">
                Welcome back, {user.firstName || user.name || user.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">
                Here&apos;s what&apos;s happening with your account
              </p>
            </motion.div>
            <motion.div {...buttonTap}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutateDashboard()}
                disabled={dashboardLoading}
              >
                <motion.div
                  animate={dashboardLoading ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                </motion.div>
                Refresh
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="container-custom py-8 space-y-8">
        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {dashboardLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          ) : dashboardError ? (
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-destructive">
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
            </Card>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                icon={Wallet}
                title="Total Contributed"
                value={`$${dashboardData?.stats.totalContributed.toFixed(0) || 0}`}
                description="Lifetime contributions"
                trend="up"
                trendValue="+12%"
                delay={0}
              />
              <StatCard
                icon={Vote}
                title="Active Votes"
                value={dashboardData?.stats.activeVotes || 0}
                description="Asset requests you've voted on"
                trend="neutral"
                delay={0.1}
              />
              <StatCard
                icon={Package}
                title="Assets Owned"
                value={dashboardData?.stats.assetsOwned || 0}
                description="Assets you have access to"
                trend="up"
                trendValue="+2"
                delay={0.2}
              />
              <StatCard
                icon={TrendingUp}
                title="Wallet Balance"
                value={`$${dashboardData?.stats.walletBalance.toFixed(2) || 0}`}
                description="Available to spend"
                trend="up"
                trendValue="+5%"
                delay={0.3}
              />
            </motion.div>
          )}
        </motion.section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                  <p className="text-sm text-muted-foreground">
                    See what the community is contributing to
                  </p>
                </div>
              </div>

              <Card className="border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Community Contributions</CardTitle>
                  <CardDescription>Real-time updates from across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activityData?.activity && activityData.activity.length > 0 ? (
                    <motion.div
                      variants={listCascade}
                      initial="hidden"
                      animate="show"
                      className="space-y-1 max-h-[400px] overflow-y-auto"
                    >
                      {activityData.activity.map((item, index) => (
                        <ActivityItem key={item.id} item={item} index={index} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      </motion.div>
                      <p>No recent activity yet</p>
                      <p className="text-sm">Be the first to contribute!</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Recommended Assets */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Trending Assets</h2>
                  <p className="text-sm text-muted-foreground">
                    Popular assets getting funded right now
                  </p>
                </div>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-2">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted animate-pulse rounded-lg mb-3" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
                        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : featuredData?.assets && featuredData.assets.length > 0 ? (
                  featuredData.assets.map((asset) => <MiniAssetCard key={asset.id} asset={asset} />)
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="p-12 text-center text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No trending assets available</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Quick Actions & My Contributions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-purple-600/10">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Get started with these options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/request" className="block">
                    <Button className="w-full justify-start bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Request an Asset
                    </Button>
                  </Link>
                  <Link href="/marketplace" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Browse Marketplace
                    </Button>
                  </Link>
                  <Link href="/wallet" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Wallet className="w-4 h-4 mr-2" />
                      Manage Wallet
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      // Copy invite link
                      navigator.clipboard.writeText(`${window.location.origin}?ref=${user.id}`);
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Invite Friends
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Contributions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">My Contributions</CardTitle>
                  <CardDescription>Assets you&apos;re helping fund</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : dashboardData?.contributions && dashboardData.contributions.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.contributions.slice(0, 4).map((contribution) => (
                        <Link
                          key={contribution.id}
                          href={`/assets/${contribution.assetId}`}
                          className="block group"
                        >
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border">
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
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                <Package className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                {contribution.asset.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${contribution.amount.toFixed(0)} contributed
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
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No contributions yet</p>
                      <Link href="/marketplace">
                        <Button size="sm" variant="outline" className="mt-3">
                          Start Contributing
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Balance Breakdown */}
            {dashboardData?.stats && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Balance Breakdown</CardTitle>
                    <CardDescription>Your wallet at a glance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available Balance</span>
                      <span className="font-semibold">
                        ${dashboardData.stats.walletBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Withdrawable</span>
                      <span className="font-semibold text-green-600">
                        ${dashboardData.stats.withdrawableBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Store Credit</span>
                      <span className="font-semibold text-purple-600">
                        ${dashboardData.stats.storeCredit.toFixed(2)}
                      </span>
                    </div>
                    <Link href="/wallet/deposit">
                      <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                        <Wallet className="w-4 h-4 mr-2" />
                        Add Funds
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
