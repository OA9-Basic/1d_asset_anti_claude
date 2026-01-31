'use client';

import { AlertCircle, Wallet, Package, TrendingUp, Vote as VoteIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/unified/stat-card';
import { UnifiedCard, CardContent } from '@/components/ui/unified/unified-card';

import type { DashboardStats } from '../types';

interface DashboardStatsProps {
  stats?: DashboardStats;
  loading: boolean;
  error: boolean;
  onRefresh: () => void;
}

export function DashboardStats({ stats, loading, error, onRefresh }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-black p-6 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <UnifiedCard variant="default" className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Failed to load dashboard data</p>
              <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </UnifiedCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Wallet}
        title="Total Contributed"
        value={`$${stats?.totalContributed.toFixed(0) || '0'}`}
        description="Lifetime contributions"
        variant="default"
      />
      <StatCard
        icon={VoteIcon}
        title="Active Votes"
        value={stats?.activeVotes || 0}
        description="Asset requests you've voted on"
        variant="info"
      />
      <StatCard
        icon={Package}
        title="Assets Owned"
        value={stats?.assetsOwned || 0}
        description="Assets you have access to"
        variant="primary"
      />
      <StatCard
        icon={TrendingUp}
        title="Wallet Balance"
        value={`$${stats?.walletBalance.toFixed(2) || '0'}`}
        description="Available to spend"
        variant="success"
      />
    </div>
  );
}
