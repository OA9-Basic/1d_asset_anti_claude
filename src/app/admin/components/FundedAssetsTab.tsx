'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { FundedAsset } from '../types';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

interface FundedAssetsTabProps {
  assets: FundedAsset[];
  onProcess: (asset: FundedAsset) => void;
}

export function FundedAssetsTab({ assets, onProcess }: FundedAssetsTabProps) {
  const purchasedAssets = assets.filter((a) => a.status === 'PURCHASED');

  return (
    <div className="border-2 rounded-xl bg-card">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Funded Assets - Ready to Process</h3>
        <p className="text-sm text-muted-foreground">
          Assets that have reached their funding goal. Purchase and process to give contributors access.
        </p>
      </div>
      <div className="p-6">
        {purchasedAssets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No assets ready for processing</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Contributors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchasedAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {asset.thumbnail && (
                        <div className="relative w-10 h-10 rounded overflow-hidden">
                          <Image
                            src={asset.thumbnail}
                            alt={asset.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{asset.title}</p>
                        <p className="text-xs text-muted-foreground">{asset.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>${prismaDecimalToNumber(asset.targetPrice).toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        prismaDecimalToNumber(asset.currentCollected) >= prismaDecimalToNumber(asset.targetPrice)
                          ? 'text-green-600 font-medium'
                          : ''
                      }
                    >
                      ${prismaDecimalToNumber(asset.currentCollected).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>{asset.contributorCount}</TableCell>
                  <TableCell>
                    <Badge variant={asset.status === 'PURCHASED' ? 'default' : 'outline'}>
                      {asset.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.status === 'PURCHASED' && (
                      <Button size="sm" onClick={() => onProcess(asset)}>
                        Process Asset
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
