'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

import { AssetCard } from '@/components/features/asset-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

type SortOption = 'newest' | 'mostFunded' | 'endingSoon' | 'trending';

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: 'newest', label: 'Newest', icon: '🕐' },
  { value: 'mostFunded', label: 'Most Funded', icon: '💰' },
  { value: 'endingSoon', label: 'Ending Soon', icon: '⏰' },
  { value: 'trending', label: 'Trending', icon: '🔥' },
];

const assetTypes = [
  { value: 'COURSE', label: 'Course', icon: '📚' },
  { value: 'AI_MODEL', label: 'AI Model', icon: '🤖' },
  { value: 'SAAS', label: 'SaaS', icon: '☁️' },
  { value: 'SOFTWARE', label: 'Software', icon: '💻' },
  { value: 'TEMPLATE', label: 'Template', icon: '📋' },
  { value: 'CODE', label: 'Code', icon: '⚙️' },
  { value: 'MODEL_3D', label: '3D Model', icon: '🎨' },
  { value: 'EBOOK', label: 'Ebook', icon: '📖' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
];

const priceRanges = [
  { value: '0-50', label: 'Under $50', min: 0, max: 50 },
  { value: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { value: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { value: '200-500', label: '$200 - $500', min: 200, max: 500 },
  { value: '500+', label: '$500+', min: 500, max: null },
];

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
  );
}

// Filter Chip Component
function FilterChip({
  label,
  isActive,
  onRemove,
}: {
  label: string;
  isActive: boolean;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant={isActive ? 'default' : 'outline'}
      className={`${
        isActive
          ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0'
          : 'hover:bg-muted'
      } cursor-pointer transition-all`}
      onClick={onRemove}
    >
      {label}
      {isActive && <X className="w-3 h-3 ml-1" />}
    </Badge>
  );
}

export default function FundingAssetsPage() {
  const _router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCursor(undefined); // Reset pagination when search changes
      setAllAssets([]); // Clear previous results
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setCursor(undefined);
    setAllAssets([]);
  }, [selectedTypes, selectedPriceRange, sortBy]);

  // Build query params
  const queryParams = new URLSearchParams({
    status: 'COLLECTING',
    sort: sortBy,
    limit: '12',
  });

  if (debouncedSearch) {
    queryParams.append('search', debouncedSearch);
  }

  if (selectedTypes.length > 0) {
    queryParams.append('type', selectedTypes.join(','));
  }

  if (selectedPriceRange) {
    const range = priceRanges.find((r) => r.value === selectedPriceRange);
    if (range) {
      if (range.min !== null) queryParams.append('minPrice', range.min.toString());
      if (range.max !== null) queryParams.append('maxPrice', range.max.toString());
    }
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

  // Toggle asset type filter
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedPriceRange('');
    setSearchQuery('');
  };

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

  // Count active filters
  const activeFilterCount =
    (searchQuery ? 1 : 0) + selectedTypes.length + (selectedPriceRange ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/marketplace"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Marketplace
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Funding Campaigns</span>
            </h1>
            <p className="text-muted-foreground">
              Contribute to upcoming assets and share in profits
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 w-fit">
            <TrendingUp className="w-4 h-4 mr-1" />
            {data?.totalCount || 0} Campaigns
          </Badge>
        </div>
      </motion.div>

      {/* Search and Sort Bar */}
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
                  placeholder="Search campaigns..."
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

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-muted' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Refresh */}
              <Button variant="outline" size="icon" onClick={() => mutate()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2">
            <CardContent className="p-6 space-y-6">
              {/* Asset Types */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Asset Type</h3>
                  {selectedTypes.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTypes([])}
                      className="text-xs"
                    >
                      Clear types
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {assetTypes.map((type) => (
                    <FilterChip
                      key={type.value}
                      label={`${type.icon} ${type.label}`}
                      isActive={selectedTypes.includes(type.value)}
                      onRemove={() => toggleType(type.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Price Range</h3>
                  {selectedPriceRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPriceRange('')}
                      className="text-xs"
                    >
                      Clear range
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map((range) => (
                    <FilterChip
                      key={range.value}
                      label={range.label}
                      isActive={selectedPriceRange === range.value}
                      onRemove={() =>
                        setSelectedPriceRange(selectedPriceRange === range.value ? '' : range.value)
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFilterCount > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                    </span>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

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
          <Card className="border-destructive">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Failed to load campaigns</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the funding campaigns. Please try again.
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6">
                {debouncedSearch || selectedTypes.length > 0 || selectedPriceRange
                  ? 'No funding campaigns match your filters'
                  : 'There are no active funding campaigns at the moment'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(debouncedSearch || selectedTypes.length > 0 || selectedPriceRange) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
                <Link href="/marketplace/available">
                  <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                    Browse Available Assets
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayedAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AssetCard asset={asset as any} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load More Button */}
      {!isLoading && !error && displayedAssets.length > 0 && data?.hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-4"
        >
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Campaigns'
            )}
          </Button>
        </motion.div>
      )}

      {/* Results Count */}
      {!isLoading && !error && displayedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          Showing {displayedAssets.length} of {data?.totalCount || 0} campaigns
        </motion.div>
      )}
    </div>
  );
}
