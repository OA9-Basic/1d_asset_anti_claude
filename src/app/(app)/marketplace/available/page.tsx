'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Package,
  RefreshCw,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import useSWR from 'swr'

import { AssetCard } from '@/components/features/asset-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  buttonTap,
  fadeInUp,
  hoverScale,
  staggerContainer,
  staggerItem,
} from '@/lib/animations'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Asset {
  id: string
  title: string
  description: string
  type: string
  status: string
  thumbnail: string | null
  targetPrice: number
  platformFee: number
  currentCollected: number
  totalPurchases: number
  totalRevenue: number
  featured: boolean
  createdAt: string
}

interface AssetsResponse {
  assets: Asset[]
  nextCursor?: string
  totalCount: number
  hasMore: boolean
}

type SortOption = 'newest' | 'mostPurchased' | 'trending' | 'priceAsc' | 'priceDesc'

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'newest', label: 'Newest', icon: '🕐' },
  { value: 'mostPurchased', label: 'Most Purchased', icon: '🔥' },
  { value: 'trending', label: 'Trending', icon: '📈' },
  { value: 'priceAsc', label: 'Price: Low to High', icon: '💰' },
  { value: 'priceDesc', label: 'Price: High to Low', icon: '💎' },
]

// Loading Skeleton Component
function AssetCardSkeleton() {
  return (
    <Card className="border-2 overflow-hidden">
      <CardContent className="p-0">
        <div className="h-52 bg-muted animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
          <div className="h-20 bg-muted animate-pulse rounded" />
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AvailableAssetsPage() {
  const _router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>()
  const [allAssets, setAllAssets] = useState<Asset[]>([])

  // Build query params
  const queryParams = new URLSearchParams({
    status: 'AVAILABLE,PURCHASED',
    sort: sortBy,
    limit: '12',
  })

  if (debouncedSearch) {
    queryParams.append('search', debouncedSearch)
  }

  if (cursor) {
    queryParams.append('cursor', cursor)
  }

  const queryString = queryParams.toString()
  const url = `/api/assets?${queryString}`

  // Fetch assets
  const { data, error, isLoading, mutate } = useSWR<AssetsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
      onSuccess: (newData) => {
        if (cursor) {
          setAllAssets((prev) => [...prev, ...newData.assets])
        } else {
          setAllAssets(newData.assets)
        }
      },
    }
  )

  const displayedAssets = cursor ? allAssets : (data?.assets || [])

  // Load more handler
  const handleLoadMore = () => {
    if (data?.nextCursor && !isLoading) {
      setCursor(data.nextCursor)
    }
  }

  // Reset to first page when sort changes
  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    setCursor(undefined)
    setAllAssets([])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <motion.div {...hoverScale} className="inline-block">
          <Link href="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Marketplace
          </Link>
        </motion.div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Available Assets</span>
            </h1>
            <p className="text-muted-foreground">
              Instantly access fully funded assets for just $1
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 w-fit">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {data?.totalCount || 0} Assets Available
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Refresh */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => mutate()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {isLoading && displayedAssets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </motion.div>
      )}

      {/* Error State */}
      {error && !isLoading && displayedAssets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Failed to load assets</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the available assets. Please try again.
              </p>
              <Button onClick={() => mutate()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayedAssets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No assets found</h3>
              <p className="text-muted-foreground mb-6">
                {debouncedSearch
                  ? `No assets match your search "${debouncedSearch}"`
                  : 'There are no available assets at the moment'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {debouncedSearch && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setDebouncedSearch('')
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                <Link href="/marketplace/funding">
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                    Browse Funding Campaigns
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Assets Grid */}
      {!isLoading && !error && displayedAssets.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayedAssets.map((asset, _index) => (
            <motion.div key={asset.id} variants={staggerItem}>
              <AssetCard asset={asset as any} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load More Button */}
      {!isLoading && !error && displayedAssets.length > 0 && data?.hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-4"
        >
          <motion.div {...buttonTap}>
            <Button
              onClick={handleLoadMore}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                  </motion.div>
                  Loading...
                </>
              ) : (
                'Load More Assets'
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Results Count */}
      {!isLoading && !error && displayedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-muted-foreground"
        >
          Showing {displayedAssets.length} of {data?.totalCount || 0} assets
        </motion.div>
      )}
    </motion.div>
  )
}
