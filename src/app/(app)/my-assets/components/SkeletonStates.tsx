'use client';

import { Package, ShoppingCart, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AssetCardSkeleton() {
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
  );
}

export function EmptyState({ activeTab }: { activeTab: string }) {
  return (
    <Card className="border-2">
      <CardContent className="p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold mb-2">No assets found</h3>
        <p className="text-muted-foreground mb-6">
          {activeTab === 'contributing' && "You're not contributing to any assets yet."}
          {activeTab === 'owned' && "You don't own any assets yet."}
          {activeTab === 'completed' && 'No funded assets yet.'}
          {activeTab === 'all' && 'Start contributing to assets to see them here.'}
        </p>
      </CardContent>
    </Card>
  );
}
