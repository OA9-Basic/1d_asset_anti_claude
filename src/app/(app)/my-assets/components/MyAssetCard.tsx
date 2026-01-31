'use client';

import { motion } from 'framer-motion';
import { Package, PlusCircle, Eye, ArrowUpRight, CheckCircle2, DollarSign, Star, ShoppingCart, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import { statusConfig } from '../types';
import type { Asset } from '../types';

interface MyAssetCardProps {
  asset: Asset;
}

export function MyAssetCard({ asset }: MyAssetCardProps) {
  const statusInfo = statusConfig[asset.status] || statusConfig.REQUESTED;
  const StatusIcon = statusInfo.icon === 'Clock' ? Clock : statusInfo.icon === 'CheckCircle2' ? CheckCircle2 : statusInfo.icon === 'ShoppingCart' ? ShoppingCart : Package;

  const getActionButton = () => {
    if (asset.status === 'COLLECTING') {
      return (
        <Link href={`/assets/${asset.id}`} className="block">
          <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Contribution
          </Button>
        </Link>
      );
    }

    if (asset.status === 'AVAILABLE' || asset.status === 'PURCHASED') {
      return (
        <Link href={`/assets/${asset.id}?access=true`} className="block">
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <Eye className="w-4 h-4 mr-2" />
            Access Asset
          </Button>
        </Link>
      );
    }

    return (
      <Link href={`/assets/${asset.id}`} className="block">
        <Button variant="outline" className="w-full">
          View Details
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    );
  };

  return (
    <motion.div whileHover={{ y: -8, transition: { duration: 0.2 } }}>
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
              <span className="text-xs text-muted-foreground">{asset.deliveryType}</span>
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
                  ${prismaDecimalToNumber(asset.userContribution).toFixed(2)}
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
                    You contributed ${prismaDecimalToNumber(asset.userContribution).toFixed(2)}
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
  );
}
