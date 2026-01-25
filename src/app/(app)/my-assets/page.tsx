'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import {
  Wallet,
  Users,
  Package,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Eye,
  PlusCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  DollarSign,
  Target,
  Star,
  Calendar,
} from 'lucide-react'
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  hoverLift,
  buttonTap,
  tabContent,
} from '@/lib/animations'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Asset {
  id: string
  title: string
  description: string
  type: string
  deliveryType: string
  targetPrice: number
  platformFee: number
  currentCollected: number
  status: string
  totalPurchases: number
  totalRevenue: number
  thumbnail: string | null
  featured: boolean
  relationship: 'contributing' | 'owned' | 'both'
  userContribution?: number
  userExcessAmount?: number
  profitShareRatio?: number
  totalProfitReceived?: number
  purchaseAmount?: number
  deliveryAccessKey?: string | null
  deliveryExpiry?: string | null
  accessCount?: number
  lastAccessedAt?: string | null
  purchasedAt?: string
  contributionId?: string
  purchaseId?: string
  progressPercent: number
  remainingAmount: number
  targetWithFee: number
  createdAt: string
}

interface MyAssetsData {
  assets: Asset[]
  stats: {
    totalInvested: number
    assetsOwned: number
    contributingCount: number
    ownedCount: number
    completedCount: number
  }
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  REQUESTED: {
    label: 'Requested',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CheckCircle2,
  },
  COLLECTING: {
    label: 'Funding',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Clock,
  },
  PURCHASED: {
    label: 'Purchased',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
  },
  AVAILABLE: {
    label: 'Available',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: ShoppingCart,
  },
  PAUSED: {
    label: 'Paused',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: Clock,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: Clock,
  },
}

// Stat Card Component
function StatCard({
  icon: Icon,
  title,
  value,
  description,
  delay,
}: {
  icon: any
  title: string
  value: string | number
  description: string
  delay?: number
}) {
  return (
    <motion.div
      variants={staggerItem}
      {...hoverLift}
      className="group"
    >
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
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Asset Card Component
function MyAssetCard({ asset }: { asset: Asset }) {
  const statusInfo = statusConfig[asset.status] || statusConfig.REQUESTED
  const StatusIcon = statusInfo.icon

  const getActionButton = () => {
    if (asset.status === 'COLLECTING') {
      return (
        <Link href={`/assets/${asset.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Contribution
          </Button>
        </Link>
      )
    }

    if (asset.status === 'AVAILABLE' || asset.status === 'PURCHASED') {
      return (
        <Link href={`/assets/${asset.id}?access=true`} className="block">
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <Eye className="w-4 h-4 mr-2" />
            Access Asset
          </Button>
        </Link>
      )
    }

    return (
      <Link href={`/assets/${asset.id}`} className="block">
        <Button variant="outline" className="w-full">
          View Details
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    )
  }

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden border-2 card-hover h-full flex flex-col">
        <CardHeader className="p-0 relative">
          {asset.thumbnail ? (
            <div className="relative overflow-hidden">
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
                src={asset.thumbnail}
                alt={asset.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              <Package className="w-16 h-16 text-slate-400" />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="absolute top-3 right-3"
          >
            <Badge className={`${statusInfo.className} backdrop-blur-sm border-0`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute top-3 left-3"
          >
            {asset.relationship === 'owned' || asset.relationship === 'both' ? (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-md">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Owned
              </Badge>
            ) : (
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-md">
                <DollarSign className="w-3 h-3 mr-1" />
                Contributed
              </Badge>
            )}
          </motion.div>
        </CardHeader>

        <CardContent className="p-5 space-y-4 flex-1">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{asset.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {asset.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {asset.deliveryType}
              </span>
            </div>
          </div>

          {asset.userContribution && asset.status === 'COLLECTING' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-200 dark:border-violet-900"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Contribution</span>
                <motion.span
                  key={asset.userContribution}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-lg text-gradient"
                >
                  ${asset.userContribution.toFixed(2)}
                </motion.span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Asset Progress</span>
                <span className="font-medium">{asset.progressPercent.toFixed(0)}%</span>
              </div>
              <Progress value={asset.progressPercent} className="h-2.5" />
              {asset.remainingAmount > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  ${asset.remainingAmount.toFixed(0)} remaining to fund
                </p>
              )}
            </motion.div>
          )}

          {asset.status === 'AVAILABLE' && asset.userContribution && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-200 dark:border-green-900"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Funded & Available!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You contributed ${asset.userContribution.toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {(asset.relationship === 'owned' || asset.relationship === 'both') && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-200 dark:border-amber-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Access Granted</span>
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                  Owner
                </Badge>
              </div>
              {asset.accessCount !== undefined && asset.accessCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Accessed {asset.accessCount} {asset.accessCount === 1 ? 'time' : 'times'}
                </p>
              )}
            </motion.div>
          )}

          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(asset.createdAt).toLocaleDateString()}
            </span>
            {asset.featured && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1 fill-white" />
                  Featured
                </Badge>
              </motion.div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
            {getActionButton()}
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Loading Skeleton
function AssetCardSkeleton() {
  return (
    <Card className="border-2 overflow-hidden">
      <div className="h-48 bg-muted animate-pulse" />
      <CardContent className="p-5 space-y-4">
        <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        <div className="h-20 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}

export default function MyAssetsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  const {
    data: assetsData,
    error: assetsError,
    isLoading: assetsLoading,
    mutate: mutateAssets,
  } = useSWR<MyAssetsData>(user ? `/api/my-assets?filter=${activeTab}` : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-muted/20 to-background"
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b bg-background/95 backdrop-blur sticky top-0 z-10"
      >
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Assets</h1>
              <p className="text-muted-foreground">Manage your contributions and owned assets</p>
            </div>
            <motion.div {...buttonTap}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutateAssets()}
                disabled={assetsLoading}
              >
                <motion.div
                  animate={assetsLoading ? { rotate: 360 } : {}}
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
        {assetsError ? (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Failed to load assets</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mutateAssets()}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            {assetsData?.stats && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <StatCard
                    icon={DollarSign}
                    title="Total Invested"
                    value={`$${assetsData.stats.totalInvested.toFixed(2)}`}
                    description="Lifetime contributions"
                    delay={0}
                  />
                  <StatCard
                    icon={Target}
                    title="Contributing"
                    value={assetsData.stats.contributingCount}
                    description="Assets funding now"
                    delay={0.1}
                  />
                  <StatCard
                    icon={Package}
                    title="Owned"
                    value={assetsData.stats.ownedCount}
                    description="Assets you own"
                    delay={0.2}
                  />
                  <StatCard
                    icon={CheckCircle2}
                    title="Completed"
                    value={assetsData.stats.completedCount}
                    description="Successfully funded"
                    delay={0.3}
                  />
                </motion.div>
              </motion.section>
            )}

            {/* Filter Tabs and Assets Grid */}
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

                <Link href="/assets">
                  <Button variant="outline" size="sm">
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
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {assetsData.assets.map((asset) => (
                    <MyAssetCard key={asset.id} asset={asset} />
                  ))}
                </motion.div>
              ) : (
                <Card className="border-2">
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-xl font-semibold mb-2">No assets found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === 'contributing' && "You're not contributing to any assets yet."}
                      {activeTab === 'owned' && "You don't own any assets yet."}
                      {activeTab === 'completed' && "No funded assets yet."}
                      {activeTab === 'all' && "Start contributing to assets to see them here."}
                    </p>
                    <Link href="/assets">
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Browse Assets
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </motion.div>
  )
}
