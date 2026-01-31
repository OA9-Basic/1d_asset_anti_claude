'use client';

import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TransactionStatus({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
    COMPLETED: {
      label: 'Success',
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      icon: CheckCircle2,
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      icon: Clock,
    },
    FAILED: {
      label: 'Failed',
      className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900/50',
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <StatusIcon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
