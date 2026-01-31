'use client';

import { Package, Wallet, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { Contribution } from '../types';

interface MyContributionsProps {
  contributions?: Contribution[];
  loading: boolean;
}

export function MyContributions({ contributions, loading }: MyContributionsProps) {
  if (loading) {
    return (
      <UnifiedCard variant="default" padding="md">
        <CardHeader>
          <CardTitle className="text-lg">My Contributions</CardTitle>
          <CardDescription>Assets you&apos;re helping fund</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </UnifiedCard>
    );
  }

  return (
    <UnifiedCard variant="default" padding="md">
      <CardHeader>
        <CardTitle className="text-lg">My Contributions</CardTitle>
        <CardDescription>Assets you&apos;re helping fund</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {contributions && contributions.length > 0 ? (
          <>
            {contributions.slice(0, 4).map((contribution) => (
              <Link key={contribution.id} href={`/assets/${contribution.assetId}`} className="block group">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
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
                    <div className="w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                      <Package className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      {contribution.asset.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      ${prismaDecimalToNumber(contribution.amount).toFixed(0)} contributed
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {contribution.asset.status}
                  </Badge>
                </div>
              </Link>
            ))}
            {contributions.length > 4 && (
              <Link href="/wallet">
                <Button variant="ghost" size="sm" className="w-full">
                  View all contributions
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No contributions yet</p>
            <Link href="/marketplace">
              <Button size="sm" variant="outline" className="mt-3 border-neutral-200 dark:border-neutral-800">
                Start Contributing
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </UnifiedCard>
  );
}
