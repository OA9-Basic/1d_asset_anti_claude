/**
 * Asset Status Badge Component
 *
 * Displays the current status of an asset with appropriate styling
 */

import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock, ShoppingCart } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export interface AssetStatus {
  label: string;
  variant: 'default' | 'outline' | 'destructive' | 'secondary';
  icon: LucideIcon;
  className: string;
  gradient: string;
}

const statusConfig: Record<string, AssetStatus> = {
  REQUESTED: {
    label: 'Requested',
    variant: 'secondary',
    icon: Clock,
    className:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    gradient: '',
  },
  APPROVED: {
    label: 'Approved',
    variant: 'default',
    icon: CheckCircle2,
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    gradient: 'from-blue-500 to-cyan-500',
  },
  COLLECTING: {
    label: 'Funding',
    variant: 'default',
    icon: Clock,
    className:
      'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    gradient: 'from-violet-500 to-purple-600',
  },
  PURCHASED: {
    label: 'Purchased',
    variant: 'outline',
    icon: CheckCircle2,
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    gradient: 'from-emerald-500 to-teal-500',
  },
  AVAILABLE: {
    label: 'Available',
    variant: 'default',
    icon: ShoppingCart,
    className:
      'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    gradient: 'from-green-500 to-emerald-600',
  },
  PAUSED: {
    label: 'Paused',
    variant: 'destructive',
    icon: Clock,
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    gradient: 'from-orange-500 to-red-500',
  },
  REJECTED: {
    label: 'Rejected',
    variant: 'destructive',
    icon: Clock,
    className:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    gradient: 'from-red-500 to-rose-500',
  },
};

export function getStatusConfig(status: string): AssetStatus {
  return statusConfig[status] || statusConfig.REQUESTED;
}

interface AssetStatusBadgeProps {
  status: string;
}

export function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={config.className} variant={config.variant}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
