'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ActivityItem } from '../types';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

export function ActivityFeedItem({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer">
      <Avatar className="h-8 w-8 border-2 border-background">
        <AvatarFallback className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 text-xs">
          {item.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{item.user.name}</span>
          <span className="text-neutral-500 dark:text-neutral-400"> contributed </span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            ${prismaDecimalToNumber(item.amount).toFixed(0)}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400"> to </span>
          <span className="font-medium">{item.asset.title}</span>
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Badge variant="outline" className="text-xs shrink-0">
        {item.asset.type}
      </Badge>
    </div>
  );
}
