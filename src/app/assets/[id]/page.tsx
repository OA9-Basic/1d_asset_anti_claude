'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  Loader2,
  Package,
  Share2,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';
import type { IconType } from '@/types/ui';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  sourceUrl: string | null;
  deliveryUrl: string | null;
  createdAt: string;
}

interface Contribution {
  id: string;
  userId: string;
  amount: number;
  excessAmount: number;
  totalProfitReceived: number;
  isInvestment: boolean;
  createdAt: string;
  user: {
    email: string;
    firstName: string | null;
  };
}

interface Purchase {
  id: string;
  userId: string;
  purchaseAmount: number;
  createdAt: string;
  user: {
    email: string;
    firstName: string | null;
  };
}

interface AssetData {
  asset: Asset;
  contributions: Contribution[];
  purchases: Purchase[];
  userContribution: Contribution | null;
  userPurchase: Purchase | null;
  hasAccess: boolean;
  accessType: string | null;
}

interface RelatedAsset {
  id: string;
  title: string;
  type: string;
  status: string;
  thumbnail: string | null;
  totalPurchases: number;
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview Image Skeleton */}
              <Card className="border-2 overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse shimmer" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                    <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>

              {/* Details Grid Skeleton */}
              <Card className="border-2">
                <CardHeader>
                  <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Action Card Skeleton */}
                <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-purple-600/10">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-12 w-full bg-muted/50 animate-pulse rounded-full" />
                    <div className="h-10 w-full bg-muted animate-pulse rounded" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card Skeleton */}
                <Card className="border-2">
                  <CardContent className="p-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center p-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Failed to Load Asset</h2>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load the asset details. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry} variant="default">
            Try Again
          </Button>
          <Link href="/marketplace">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

// Breadcrumb Component
function Breadcrumb({ assetId: _assetId }: { assetId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
    >
      <Link
        href="/marketplace"
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Marketplace
      </Link>
      <span>/</span>
      <span className="text-foreground font-medium">Asset Details</span>
    </motion.div>
  );
}

// Share Button Component
function ShareButton({ assetId }: { assetId: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/assets/${assetId}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast({
          title: 'Link copied!',
          description: 'Asset link copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        toast({
          title: 'Link copied!',
          description: 'Asset link copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard',
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
      {copied ? (
        <>
          <ArrowLeft className="w-4 h-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </Button>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Related Assets Card
function RelatedAssetCard({ asset }: { asset: RelatedAsset }) {
  return (
    <Link href={`/assets/${asset.id}`} className="block group">
      <Card className="overflow-hidden border-2 card-hover h-full">
        <div className="relative aspect-video overflow-hidden">
          {asset.thumbnail ? (
            <Image
              src={asset.thumbnail}
              alt={asset.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400" />
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

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contributionAmount, setContributionAmount] = useState('1');
  const [isContributing, setIsContributing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [_retryCount, setRetryCount] = useState(0);

  const assetId = params.id as string;

  const { data, error, isLoading, mutate } = useSWR<AssetData>(`/api/assets/${assetId}`, fetcher);

  // Fetch related assets
  const { data: relatedData } = useSWR<{ assets: RelatedAsset[] }>(
    `/api/assets/related?assetId=${assetId}&limit=4`,
    fetcher
  );

  const handleContribute = async () => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Minimum contribution is $1',
      });
      return;
    }

    setIsContributing(true);
    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, amount }),
      });

      if (res.ok) {
        const result = await res.json();
        toast({
          title: 'Contribution Successful!',
          description: result.message,
        });
        mutate();
        setContributionAmount('1');
      } else {
        const error = await res.json();
        toast({
          variant: 'destructive',
          title: 'Contribution Failed',
          description: error.error || 'Failed to contribute',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process contribution',
      });
    } finally {
      setIsContributing(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    setIsPurchasing(true);
    try {
      const res = await fetch(`/api/assets/${assetId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      if (res.ok) {
        toast({
          title: 'Purchase Successful!',
          description: 'You now have access to this asset',
        });
        mutate();
      } else {
        const _error = await res.json();
        toast({
          variant: 'destructive',
          title: 'Purchase Failed',
          description: _error.error || 'Failed to purchase',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process purchase',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return <ErrorState onRetry={() => setRetryCount((prev) => prev + 1)} />;
  }

  const {
    asset,
    contributions,
    purchases,
    userContribution,
    userPurchase: _userPurchase,
    hasAccess,
  } = data;
  const targetWithFee = asset.targetPrice * (1 + asset.platformFee);
  const progressPercent = Math.min((asset.currentCollected / targetWithFee) * 100, 100);
  const remainingAmount = Math.max(targetWithFee - asset.currentCollected, 0);

  const statusConfig = {
    COLLECTING: {
      label: 'Funding',
      color: 'bg-blue-500',
      bgLight: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      icon: Clock,
    },
    PURCHASED: {
      label: 'Processing',
      color: 'bg-yellow-500',
      bgLight: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: Clock,
    },
    AVAILABLE: {
      label: 'Available',
      color: 'bg-green-500',
      bgLight: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      icon: CheckCircle2,
    },
  };

  const status = statusConfig[asset.status as keyof typeof statusConfig] || statusConfig.COLLECTING;
  const StatusIcon = status.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb & Share */}
          <div className="flex items-center justify-between mb-6">
            <Breadcrumb assetId={assetId} />
            <ShareButton assetId={assetId} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (65%) - Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              {/* Preview Image & Title */}
              <Card className="border-2 overflow-hidden">
                <div className="relative aspect-video overflow-hidden group">
                  {asset.thumbnail ? (
                    <Image
                      src={asset.thumbnail}
                      alt={asset.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center rounded-2xl">
                      <Package className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="backdrop-blur-sm bg-white/90 dark:bg-black/90">
                      {asset.type}
                    </Badge>
                    <Badge className={`${status.bgLight} ${status.text} backdrop-blur-sm`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                    {hasAccess && (
                      <Badge className="bg-green-500/90 text-white backdrop-blur-sm">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        You Own This
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold mb-3 text-gradient">{asset.title}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {asset.totalPurchases + contributions.length} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          Featured Asset
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {asset.description}
                  </p>
                </CardContent>
              </Card>

              {/* Why This Asset Section */}
              <motion.div variants={itemVariants}>
                <Card className="border-2 bg-gradient-to-br from-violet-500/5 to-purple-600/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      Why This Asset?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">High Quality</h4>
                          <p className="text-sm text-muted-foreground">
                            Verified premium content from trusted sources
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Great Value</h4>
                          <p className="text-sm text-muted-foreground">
                            Access premium assets for just $1
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">Community Funded</h4>
                          <p className="text-sm text-muted-foreground">
                            Backed by {contributions.length} contributor
                            {contributions.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Asset Details Grid */}
              <motion.div variants={itemVariants}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Asset Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Asset Type</p>
                        <p className="font-semibold text-lg">{asset.type}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Delivery</p>
                        <p className="font-semibold text-lg">{asset.deliveryType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Platform Fee</p>
                        <p className="font-semibold text-lg">
                          {(prismaDecimalToNumber(asset.platformFee) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="font-semibold text-lg text-green-600">
                          ${prismaDecimalToNumber(asset.totalRevenue).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {asset.sourceUrl && (
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Source</p>
                        <a
                          href={asset.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          View Original Source
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {hasAccess && asset.deliveryUrl && (
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-muted-foreground mb-3">Your Access</p>
                        <a
                          href={asset.deliveryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            size="lg"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Access Asset Now
                          </Button>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tabs */}
              <motion.div variants={itemVariants}>
                <Card className="border-2">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                      <TabsTrigger
                        value="details"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                      >
                        Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="contributors"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                      >
                        Contributors ({contributions.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="purchases"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
                      >
                        Purchases ({purchases.length})
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent value="details" className="mt-0">
                        <CardContent className="p-6">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                          >
                            <h3 className="text-lg font-semibold">About This Asset</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              This asset is currently in the{' '}
                              <strong>{asset.status.toLowerCase()}</strong> phase.
                              {asset.status === 'COLLECTING' &&
                                ' It requires community funding to be purchased and made available to all contributors.'}
                              {asset.status === 'AVAILABLE' &&
                                ' It has been fully funded and is now available for purchase.'}
                              {asset.status === 'PURCHASED' &&
                                ' It has been purchased and is currently being processed for delivery.'}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                              <div className="p-4 rounded-xl bg-muted/50 border">
                                <p className="text-sm text-muted-foreground mb-1">Created</p>
                                <p className="font-medium">
                                  {new Date(asset.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50 border">
                                <p className="text-sm text-muted-foreground mb-1">
                                  Total Purchases
                                </p>
                                <p className="font-medium">{asset.totalPurchases}</p>
                              </div>
                            </div>
                          </motion.div>
                        </CardContent>
                      </TabsContent>

                      <TabsContent value="contributors" className="mt-0">
                        <CardContent className="p-6">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {contributions.length === 0 ? (
                              <EmptyState
                                icon={Users}
                                title="No Contributors Yet"
                                description="Be the first to contribute to this asset!"
                              />
                            ) : (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Contributor</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                      <TableHead className="text-right">Investment</TableHead>
                                      <TableHead className="text-right">Profit Received</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {contributions.map((c) => (
                                      <TableRow key={c.id}>
                                        <TableCell className="font-medium">
                                          <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-semibold">
                                              {c.user.firstName?.charAt(0) ||
                                                c.user.email.charAt(0).toUpperCase()}
                                            </div>
                                            {c.user.firstName || c.user.email}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          ${prismaDecimalToNumber(c.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {prismaDecimalToNumber(c.excessAmount) > 0 ? (
                                            <span className="text-blue-600 font-medium">
                                              ${prismaDecimalToNumber(c.excessAmount).toFixed(2)}
                                            </span>
                                          ) : (
                                            <span className="text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {prismaDecimalToNumber(c.totalProfitReceived) > 0 ? (
                                            <span className="text-green-600 font-medium">
                                              ${prismaDecimalToNumber(c.totalProfitReceived).toFixed(2)}
                                            </span>
                                          ) : (
                                            <span className="text-muted-foreground">-</span>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </motion.div>
                        </CardContent>
                      </TabsContent>

                      <TabsContent value="purchases" className="mt-0">
                        <CardContent className="p-6">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {purchases.length === 0 ? (
                              <EmptyState
                                icon={ShoppingCart}
                                title="No Purchases Yet"
                                description="This asset hasn't been purchased yet"
                              />
                            ) : (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Buyer</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                      <TableHead className="text-right">Date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {purchases.map((p) => (
                                      <TableRow key={p.id}>
                                        <TableCell className="font-medium">
                                          <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-semibold">
                                              {p.user.firstName?.charAt(0) ||
                                                p.user.email.charAt(0).toUpperCase()}
                                            </div>
                                            {p.user.firstName || p.user.email}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          ${prismaDecimalToNumber(p.purchaseAmount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                          {new Date(p.createdAt).toLocaleDateString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </motion.div>
                        </CardContent>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </Card>
              </motion.div>
            </motion.div>

            {/* Right Column (35%) - Sticky Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Action Card */}
                <Card className="border-2 bg-gradient-to-br from-violet-500/10 to-purple-600/10 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {asset.status === 'COLLECTING'
                          ? 'Funding Goal'
                          : asset.status === 'AVAILABLE'
                            ? 'Price'
                            : 'Status'}
                      </p>
                      <p className="text-4xl font-bold text-gradient">
                        {asset.status === 'COLLECTING'
                          ? `$${targetWithFee.toFixed(2)}`
                          : asset.status === 'AVAILABLE'
                            ? '$1.00'
                            : 'Processing'}
                      </p>
                    </div>

                    {/* Progress Bar for COLLECTING */}
                    {asset.status === 'COLLECTING' && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${prismaDecimalToNumber(asset.currentCollected).toFixed(2)} collected
                          </span>
                          <span className="font-semibold">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-3" />
                        {remainingAmount > 0 && (
                          <p className="text-sm text-muted-foreground text-center">
                            ${remainingAmount.toFixed(2)} remaining to fund
                          </p>
                        )}
                      </div>
                    )}

                    {/* Contributors Count */}
                    <div className="flex items-center justify-center gap-2 text-sm py-3 border-y">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{contributions.length} contributors</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium">{asset.totalPurchases} purchases</span>
                    </div>

                    {/* Action Buttons */}
                    {!hasAccess && (
                      <div className="space-y-3">
                        {asset.status === 'COLLECTING' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="amount">Contribution Amount ($)</Label>
                              <Input
                                id="amount"
                                type="number"
                                min="1"
                                step="0.01"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                                className="text-lg"
                              />
                              <p className="text-xs text-muted-foreground">
                                Min $1. Contribute more to earn profit share!
                              </p>
                            </div>
                            <Button
                              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold h-12"
                              onClick={handleContribute}
                              disabled={isContributing}
                              size="lg"
                            >
                              {isContributing ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Contributing...
                                </>
                              ) : (
                                <>
                                  <Wallet className="w-5 h-5 mr-2" />
                                  Contribute ${parseFloat(contributionAmount || '1').toFixed(2)}
                                </>
                              )}
                            </Button>
                          </>
                        )}

                        {asset.status === 'AVAILABLE' && (
                          <Button
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold h-12"
                            onClick={handlePurchase}
                            disabled={isPurchasing}
                            size="lg"
                          >
                            {isPurchasing ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Buy for $1.00
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {asset.status === 'COLLECTING' ? 'Your contribution' : 'Purchase price'}
                        </span>
                        <span className="font-medium">
                          {asset.status === 'COLLECTING'
                            ? `$${parseFloat(contributionAmount || '1').toFixed(2)}`
                            : '$1.00'}
                        </span>
                      </div>
                      {asset.status === 'COLLECTING' &&
                        parseFloat(contributionAmount || '1') >
                          asset.targetPrice / contributions.length && (
                          <div className="flex justify-between text-sm text-blue-600">
                            <span>Potential investment</span>
                            <span className="font-medium">
                              $
                              {Math.max(
                                0,
                                parseFloat(contributionAmount || '1') -
                                  asset.targetPrice / Math.max(contributions.length, 1)
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>

                {/* User Investment Info */}
                {userContribution && userContribution.excessAmount > 0 && (
                  <Card className="border-2 bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Your Investment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Invested Amount</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${prismaDecimalToNumber(userContribution.excessAmount).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Profit Received</p>
                        <p className="text-xl font-semibold text-green-600">
                          ${prismaDecimalToNumber(userContribution.totalProfitReceived).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining Investment</p>
                        <p className="text-lg font-medium">
                          $
                          {(
                            prismaDecimalToNumber(userContribution.excessAmount) - prismaDecimalToNumber(userContribution.totalProfitReceived)
                          ).toFixed(2)}
                        </p>
                      </div>
                      <Progress
                        value={
                          (userContribution.totalProfitReceived / userContribution.excessAmount) *
                          100
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        You&apos;ll receive profit share from future purchases until fully refunded
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <Card className="border-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Contributors</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{contributions.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Purchases</span>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{asset.totalPurchases}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Revenue</span>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          ${prismaDecimalToNumber(asset.totalRevenue).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={`${status.bgLight} ${status.text}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Related Assets */}
          {relatedData?.assets && relatedData.assets.length > 0 && (
            <motion.div variants={itemVariants} className="mt-12 pt-8 border-t">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Related Assets</h2>
                <p className="text-muted-foreground">
                  You might also be interested in these assets
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedData.assets.map((relatedAsset) => (
                  <RelatedAssetCard key={relatedAsset.id} asset={relatedAsset} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
