/**
 * Asset Status Badge Component
 *
 * Displays the current status of an asset with appropriate styling
 */

import { Badge } from '@/components/ui/badge';

import { getStatusConfig } from './asset-status-utils';

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
