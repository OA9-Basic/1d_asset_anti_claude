'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Package,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { AssetCard } from '@/components/features/asset-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UnifiedCard, CardContent } from '@/components/ui/unified/unified-card';
import { buttonTap, fadeInUp, hoverScale, staggerContainer, staggerItem } from '@/lib/animations';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  thumbnail: string | null;
  targetPrice: number;
  platformFee: number;
  currentCollected: number;
  totalPurchases: number;
  totalRevenue: number;
  featured: boolean;
  createdAt: string;
}

interface AssetsResponse {
  assets: Asset[];
  nextCursor?: string;
  totalCount: number;
  hasMore: boolean;
}

type SortOption = 'newest' | 'mostPurchased' | 'trending' | 'priceAsc' | 'priceDesc';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'mostPurchased', label: 'Most Purchased' },
  { value: 'trending', label: 'Trending' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
];

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Loading Skeleton Component
function AssetCardSkeleton() {
  return (
    <UnifiedCard variant="default" padding="none" className="overflow-hidden">
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium" />
      <div className="p-5 space-y-4">
        <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium rounded" />
        <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium rounded" />
        <div className="h-20 bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium rounded" />
        <div className="h-10 bg-zinc-100 dark:bg-zinc-900 animate-pulse shimmer-premium rounded" />
      </div>
    </UnifiedCard>
  );
}

export default function AvailableAssetsPage() {
  const _router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [cursor, setCursor] = useState<string | undefined>();
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  // Use debounce hook with 500ms delay
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Build query params
  const queryParams = new URLSearchParams({
    status: 'AVAILABLE,PURCHASED',
    sort: sortBy,
    limit: '12',
  });

  if (debouncedSearch) {
    queryParams.append('search', debouncedSearch);
  }

  if (cursor) {
    queryParams.append('cursor', cursor);
  }

  const queryString = queryParams.toString();
  const url = `/api/assets?${queryString}`;

  // Fetch assets
  const { data, error, isLoading, mutate } = useSWR<AssetsResponse>(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
    onSuccess: (newData) => {
      if (cursor) {
        setAllAssets((prev) => [...prev, ...newData.assets]);
      } else {
        setAllAssets(newData.assets);
      }
    },
  });

  const displayedAssets = cursor ? allAssets : data?.assets || [];

  // Load more handler
  const handleLoadMore = () => {
    if (data?.nextCursor && !isLoading) {
      setCursor(data.nextCursor);
    }
  };

  // Reset to first page when sort changes
  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCursor(undefined);
    setAllAssets([]);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div variants={fadeInUp} initial="initial" animate="animate">
          <motion.div {...hoverScale} className="inline-block">
            <Link
              href="/marketplace"
              className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-100 mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Marketplace
            </Link>
          </motion.div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-zinc-100">
                Available Assets
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Instantly access fully funded assets for just $1
              </p>
            </div>
            <Badge className="bg-zinc-100 text-zinc-900 border-0 w-fit">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {data?.totalCount || 0} Assets Available
            </Badge>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="sticky top-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-sm py-4 -mx-6 px-6 sm:mx-0 sm:px-0"
        >
          <UnifiedCard variant="default" padding="md" className="border-zinc-800/60">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800"
                  />
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-zinc-900/50 border-zinc-800">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Refresh */}
                <Button variant="outline" size="icon" onClick={() => mutate()} disabled={isLoading} className="border-zinc-800">
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </UnifiedCard>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <UnifiedCard variant="default" padding="lg" className="border-red-900/50 bg-red-950/30">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">Failed to load assets</h3>
                <p className="text-zinc-400 mb-4">
                  There was an error loading the available assets. Please try again.
                </p>
                <Button onClick={() => mutate()} variant="outline" className="border-zinc-800">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </UnifiedCard>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayedAssets.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <UnifiedCard variant="default" padding="lg" className="border-zinc-800/60">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">No assets found</h3>
                <p className="text-zinc-500 mb-6">
                  {debouncedSearch
                    ? `No assets match your search "${debouncedSearch}"`
                    : 'There are no available assets at the moment'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {debouncedSearch && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="border-zinc-800"
                    >
                      Clear Search
                    </Button>
                  )}
                  <Link href="/marketplace/funding">
                    <Button className="bg-zinc-100 text-black hover:bg-zinc-200">
                      Browse Funding Campaigns
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </UnifiedCard>
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
                <AssetCard asset={asset} />
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
                className="bg-zinc-100 text-black hover:bg-zinc-200"
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
            className="text-center text-sm text-zinc-500"
          >
            Showing {displayedAssets.length} of {data?.totalCount || 0} assets
          </motion.div>
        )}
      </div>
    </div>
  );
}
