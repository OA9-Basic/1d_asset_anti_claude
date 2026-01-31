'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AssetRequest } from '../types';

interface ApproveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AssetRequest | null;
  platformFee: string;
  onPlatformFeeChange: (value: string) => void;
  platformFeeAfterExcess: string;
  onPlatformFeeAfterExcessChange: (value: string) => void;
  profitDistributionTiming: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  onProfitDistributionTimingChange: (value: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM') => void;
  customDistributionInterval: string;
  onCustomDistributionIntervalChange: (value: string) => void;
  onApprove: () => void;
  isProcessing?: boolean;
}

export function ApproveRequestDialog({
  open,
  onOpenChange,
  request,
  platformFee,
  onPlatformFeeChange,
  platformFeeAfterExcess,
  onPlatformFeeAfterExcessChange,
  profitDistributionTiming,
  onProfitDistributionTimingChange,
  customDistributionInterval,
  onCustomDistributionIntervalChange,
  onApprove,
  isProcessing = false,
}: ApproveRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Asset Request</DialogTitle>
          <DialogDescription>Add "{request?.title}" to the platform</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Platform Fee During Refund (%)</Label>
            <Input
              type="number"
              value={platformFee}
              onChange={(e) => onPlatformFeeChange(e.target.value)}
              min="0"
              max="100"
              step="1"
            />
            <p className="text-xs text-muted-foreground">
              Percentage taken while refunding excess to investors (default: 15%)
            </p>
          </div>
          <div className="space-y-2">
            <Label>Platform Fee After Refund (%)</Label>
            <Input
              type="number"
              value={platformFeeAfterExcess}
              onChange={(e) => onPlatformFeeAfterExcessChange(e.target.value)}
              min="0"
              max="100"
              step="1"
            />
            <p className="text-xs text-muted-foreground">
              Percentage taken after all excess is refunded (default: 100%)
            </p>
          </div>
          <div className="space-y-2">
            <Label>Profit Distribution Timing</Label>
            <Select value={profitDistributionTiming} onValueChange={onProfitDistributionTimingChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMMEDIATE">Immediate (after each purchase)</SelectItem>
                <SelectItem value="DAILY">Daily</SelectItem>
                <SelectItem value="WEEKLY">Weekly</SelectItem>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">When to distribute profits to investors</p>
          </div>
          {profitDistributionTiming === 'CUSTOM' && (
            <div className="space-y-2">
              <Label>Custom Interval (hours)</Label>
              <Input
                type="number"
                value={customDistributionInterval}
                onChange={(e) => onCustomDistributionIntervalChange(e.target.value)}
                min="1"
                max="8760"
                step="1"
                placeholder="e.g., 6 for every 6 hours"
              />
              <p className="text-xs text-muted-foreground">How often to distribute profits in hours</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={onApprove} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600" disabled={isProcessing}>
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Add Asset
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
