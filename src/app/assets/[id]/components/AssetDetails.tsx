'use client';

import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Asset } from '../types';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

interface AssetDetailsProps {
  asset: Asset;
  hasAccess: boolean;
}

export function AssetDetails({ asset, hasAccess }: AssetDetailsProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Asset Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Asset Type</p>
            <p className="font-semibold text-lg">{asset.type}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Delivery</p>
            <p className="font-semibold text-lg">{asset.deliveryType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Platform Fee</p>
            <p className="font-semibold text-lg">
              {(prismaDecimalToNumber(asset.platformFee) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="font-semibold text-lg text-green-600">
              ${prismaDecimalToNumber(asset.totalRevenue).toFixed(2)}
            </p>
          </div>
        </div>
        {asset.sourceUrl && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Source</p>
            <a
              href={asset.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium"
            >
              View Original Source
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
        {hasAccess && asset.deliveryUrl && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">Your Access</p>
            <a
              href={asset.deliveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Access Asset Now
              </Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
