'use client';

import { motion } from 'framer-motion';
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
import Link from 'next/link';
import useSWR from 'swr';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

// Stat Card Component
function StatCard({
  icon: Icon,
  title,
  value,
  description,
  delay,
}: {
  icon: any;
  title: string;
  value: string | number;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay || 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group"
    >
      <Card className="border-2 card-hover overflow-hidden h-full">
        <CardContent className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow mb-4">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-gradient">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Featured Asset Card
function FeaturedAssetCard({ asset }: { asset: Asset }) {
  return (
    <Link href={`/assets/${asset.id}`} className="block group">
      <Card className="overflow-hidden border-2 card-hover h-full">
        <div className="relative aspect-video overflow-hidden">
          {asset.thumbnail ? (
            <img
              src={asset.thumbnail}
              alt={asset.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {asset.type}
            </Badge>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {asset.totalPurchases}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MarketplacePage() {
  // Fetch featured assets
  const { data: featuredData, isLoading: featuredLoading } = useSWR<FeaturedAssetsData>(
    '/api/assets/featured?limit=6',
    fetcher
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover, fund, and access premium digital assets
          </p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            title="Total Assets"
            value={featuredData?.assets?.length || 0}
            description="Available assets"
            delay={0}
          />
          <StatCard
            icon={Users}
            title="Active Funders"
            value="1,200+"
            description="Community members"
            delay={0.1}
          />
          <StatCard
            icon={DollarSign}
            title="Total Funded"
            value="$50K+"
            description="Contributed to assets"
            delay={0.2}
          />
          <StatCard
            icon={Zap}
            title="Success Rate"
            value="95%"
            description="Assets fully funded"
            delay={0.3}
          />
        </div>
      </motion.div>

      {/* Marketplace Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-purple-600/10">
          <CardHeader>
            <CardTitle className="text-2xl">Browse Marketplace</CardTitle>
            <CardDescription>Choose a category to explore available assets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Assets */}
            <Link href="/marketplace/available" className="block group">
              <div className="flex items-center justify-between p-6 rounded-xl border-2 bg-card hover:border-primary hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Available Assets
                    </h3>
                    <p className="text-muted-foreground">
                      Instantly access fully funded assets for just $1
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>

            {/* Funding Assets */}
            <Link href="/marketplace/funding" className="block group">
              <div className="flex items-center justify-between p-6 rounded-xl border-2 bg-card hover:border-primary hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Funding Campaigns
                    </h3>
                    <p className="text-muted-foreground">
                      Contribute to upcoming assets and share in profits
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Featured Assets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Featured Assets</h2>
            <p className="text-sm text-muted-foreground">Hand-picked assets from our community</p>
          </div>
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
            featuredData.assets.map((asset) => <FeaturedAssetCard key={asset.id} asset={asset} />)
          ) : (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No featured assets available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
            <CardDescription>Simple steps to get started with our marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">1. Browse Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Explore our collection of courses, AI models, software, and more
                </p>
              </div>
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg mx-auto mb-4">
                  <DollarSign className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">2. Fund or Purchase</h3>
                <p className="text-sm text-muted-foreground">
                  Contribute to funding campaigns or buy available assets for $1
                </p>
              </div>
              <div className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-2">3. Get Access</h3>
                <p className="text-sm text-muted-foreground">
                  Instantly access your purchased assets or earn profits from contributions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
