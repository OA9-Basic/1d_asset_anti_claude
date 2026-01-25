'use client';

import { Asset } from '@prisma/client';
import { motion } from 'framer-motion';
import {
  Wallet,
  CheckCircle2,
  Clock,
  Users,
  ShoppingCart,
  Star,
  DollarSign,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, memo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AssetCardProps {
  asset: Asset & {
    _count?: {
      pledges: number;
    };
  };
}

const statusConfig = {
  REQUESTED: {
    label: 'Requested',
    variant: 'secondary' as const,
    icon: Clock,
    className:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    gradient: '',
  },
  APPROVED: {
    label: 'Approved',
    variant: 'default' as const,
    icon: CheckCircle2,
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    gradient: 'from-blue-500 to-cyan-500',
  },
  COLLECTING: {
    label: 'Funding',
    variant: 'default' as const,
    icon: Clock,
    className:
      'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    gradient: 'from-violet-500 to-purple-600',
  },
  PURCHASED: {
    label: 'Purchased',
    variant: 'outline' as const,
    icon: CheckCircle2,
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    gradient: 'from-emerald-500 to-teal-500',
  },
  AVAILABLE: {
    label: 'Available',
    variant: 'default' as const,
    icon: ShoppingCart,
    className:
      'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    gradient: 'from-green-500 to-emerald-600',
  },
  PAUSED: {
    label: 'Paused',
    variant: 'destructive' as const,
    icon: Clock,
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    gradient: 'from-orange-500 to-red-500',
  },
  REJECTED: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: Clock,
    className:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    gradient: 'from-red-500 to-rose-500',
  },
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export const AssetCard = memo(function AssetCard({ asset }: AssetCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const statusInfo = statusConfig[asset.status];
  const StatusIcon = statusInfo.icon;

  // Calculate progress including platform fee
  const platformFee = asset.platformFee || 0.15;
  const targetWithFee = asset.targetPrice * (1 + platformFee);
  const progressPercent = Math.min((Number(asset.currentCollected) / targetWithFee) * 100, 100);
  const remainingAmount = Math.max(targetWithFee - Number(asset.currentCollected), 0);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      toast({
        title: 'Purchase Successful!',
        description: `You now have access to ${asset.title}`,
        variant: 'default',
      });

      router.push(`/assets/${asset.id}?access=true`);
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (e: React.MouseEvent) => {
    if (asset.status === 'COLLECTING') {
      router.push(`/assets/${asset.id}`);
    } else if (asset.status === 'AVAILABLE') {
      handlePurchase(e);
    }
  };

  const getActionButton = () => {
    switch (asset.status) {
      case 'COLLECTING':
        return (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className={`w-full h-12 bg-gradient-to-r ${statusInfo.gradient} hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold rounded-xl`}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 mr-2" />
                  Contribute Now
                </>
              )}
            </Button>
          </motion.div>
        );
      case 'AVAILABLE':
        return (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className={`w-full h-12 bg-gradient-to-r ${statusInfo.gradient} hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold rounded-xl`}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Get for $1
                </>
              )}
            </Button>
          </motion.div>
        );
      case 'PURCHASED':
        return (
          <Button
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg font-semibold rounded-xl"
            onClick={() => router.push(`/assets/${asset.id}`)}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            View Asset
          </Button>
        );
      default:
        return (
          <Button
            className="w-full h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium rounded-xl cursor-not-allowed"
            variant="outline"
            disabled
          >
            <StatusIcon className="w-5 h-5 mr-2" />
            {statusInfo.label}
          </Button>
        );
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" layout>
      <Link href={`/assets/${asset.id}`} className="block">
        <motion.div
          variants={cardVariants}
          whileHover={{
            scale: 1.02,
            y: -4,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          className="relative group"
        >
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
            {/* Thumbnail Section */}
            <div className="relative overflow-hidden rounded-t-2xl">
              {asset.thumbnail && !imageError ? (
                <>
                  <motion.img
                    src={asset.thumbnail}
                    alt={asset.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImageError(true)}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      No preview available
                    </p>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <motion.div
                className="absolute top-4 right-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Badge
                  className={`${statusInfo.className} backdrop-blur-md shadow-lg border-2 px-3 py-1.5 text-sm font-semibold rounded-full`}
                >
                  <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                  {statusInfo.label}
                </Badge>
              </motion.div>

              {/* Featured Badge */}
              {asset.featured && (
                <motion.div
                  className="absolute top-4 left-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg px-3 py-1.5 text-sm font-semibold rounded-full">
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-white" />
                    Featured
                  </Badge>
                </motion.div>
              )}

              {/* Price Tag for AVAILABLE status */}
              {asset.status === 'AVAILABLE' && (
                <motion.div
                  className="absolute bottom-4 right-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-lg">
                    <DollarSign className="w-4 h-4 inline-block mr-1" />1
                  </div>
                </motion.div>
              )}
            </div>

            <CardContent className="p-6 space-y-5">
              {/* Title and Type */}
              <div className="space-y-2">
                <h3 className="font-bold text-xl line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {asset.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium px-2.5 py-1 rounded-full">
                    {asset.type}
                  </Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {asset.deliveryType}
                  </span>
                </div>
              </div>

              {/* Progress for COLLECTING status */}
              {asset.status === 'COLLECTING' && (
                <motion.div
                  className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-200 dark:border-violet-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Raised
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        ${Number(asset.currentCollected).toFixed(0)}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Goal</p>
                      <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                        ${targetWithFee.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Progress
                      </span>
                      <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {progressPercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                      {/* Animated shimmer effect */}
                      <motion.div
                        className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    </div>
                    {remainingAmount > 0 && (
                      <p className="text-xs text-center text-slate-600 dark:text-slate-400 font-medium">
                        ${remainingAmount.toFixed(0)} remaining to fund
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Available/Purchased status */}
              {(asset.status === 'AVAILABLE' || asset.status === 'PURCHASED') && (
                <motion.div
                  className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-700 dark:text-green-400 text-lg">
                        {asset.status === 'AVAILABLE' ? 'Instant Access' : 'Fully Funded'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {asset.totalPurchases || 0} people have access
                      </p>
                    </div>
                  </div>
                  {asset.status === 'AVAILABLE' && (
                    <div className="pt-3 border-t border-green-200/50 dark:border-green-800/50">
                      <p className="text-sm text-center text-green-700 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 py-2 px-4 rounded-lg">
                        Get instant access for just $1
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Stats Footer */}
              <motion.div
                className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{asset.totalPurchases || 0}</span>
                  </span>
                  {asset.totalRevenue > 0 && (
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">${asset.totalRevenue.toFixed(0)}</span>
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {getActionButton()}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
});
