'use client';

import { PlusCircle, ShoppingCart, Wallet, Share2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { UnifiedCard, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/unified/unified-card';

interface QuickActionsProps {
  userId: string;
}

export function QuickActions({ userId }: QuickActionsProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?ref=${userId}`);
  };

  return (
    <UnifiedCard variant="default" padding="md">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with these options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Link href="/request" className="block">
          <Button className="w-full justify-start bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90">
            <PlusCircle className="w-4 h-4 mr-2" />
            Request an Asset
          </Button>
        </Link>
        <Link href="/marketplace" className="block">
          <Button variant="outline" className="w-full justify-start border-neutral-200 dark:border-neutral-800">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Browse Marketplace
          </Button>
        </Link>
        <Link href="/wallet" className="block">
          <Button variant="outline" className="w-full justify-start border-neutral-200 dark:border-neutral-800">
            <Wallet className="w-4 h-4 mr-2" />
            Manage Wallet
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start border-neutral-200 dark:border-neutral-800"
          onClick={handleShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Invite Friends
        </Button>
      </CardContent>
    </UnifiedCard>
  );
}
