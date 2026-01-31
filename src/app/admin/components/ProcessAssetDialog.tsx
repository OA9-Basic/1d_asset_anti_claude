'use client';

import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import type { FundedAsset } from '../types';

interface ProcessAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: FundedAsset | null;
  deliveryData: { deliveryUrl: string; streamUrl: string; deliveryKey: string };
  onDeliveryDataChange: (data: { deliveryUrl: string; streamUrl: string; deliveryKey: string }) => void;
  onProcess: () => void;
  isProcessing?: boolean;
}

export function ProcessAssetDialog({
  open,
  onOpenChange,
  asset,
  deliveryData,
  onDeliveryDataChange,
  onProcess,
  isProcessing = false,
}: ProcessAssetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Process Funded Asset</DialogTitle>
          <DialogDescription>
            Process &quot;{asset?.title}&quot; after purchasing the actual product
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
            <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">Before processing:</p>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Purchase the actual course/product using the collected funds</li>
              <li>Get the delivery URL/access credentials</li>
              <li>Update the asset with delivery information</li>
              <li>Click &quot;Process Asset&quot; to give contributors access</li>
            </ol>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Asset:</strong> {asset?.title}</p>
            <p><strong>Target Price:</strong> ${asset ? prismaDecimalToNumber(asset.targetPrice).toFixed(2) : '0.00'}</p>
            <p><strong>Collected:</strong> ${asset ? prismaDecimalToNumber(asset.currentCollected).toFixed(2) : '0.00'}</p>
            <p className="text-muted-foreground">
              Contributors will receive access to the asset. Any excess contributions will be refunded to their withdrawable balance.
            </p>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-sm">Delivery Information (Optional)</h4>
            <div className="space-y-2">
              <Label>Download URL</Label>
              <Input
                placeholder="https://example.com/download.zip"
                value={deliveryData.deliveryUrl}
                onChange={(e) => onDeliveryDataChange({ ...deliveryData, deliveryUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Stream URL</Label>
              <Input
                placeholder="https://vimeo.com/..."
                value={deliveryData.streamUrl}
                onChange={(e) => onDeliveryDataChange({ ...deliveryData, streamUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Access Key / Password</Label>
              <Input
                placeholder="Secret key for access"
                value={deliveryData.deliveryKey}
                onChange={(e) => onDeliveryDataChange({ ...deliveryData, deliveryKey: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={onProcess} className="flex-1" disabled={isProcessing}>
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Asset
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
