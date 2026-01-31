'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RejectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestTitle: string | undefined;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
  onReject: () => void;
}

export function RejectRequestDialog({
  open,
  onOpenChange,
  requestTitle,
  rejectionReason,
  onRejectionReasonChange,
  onReject,
}: RejectRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Asset Request</DialogTitle>
          <DialogDescription>Reject &quot;{requestTitle}&quot;</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rejection Reason</Label>
            <Textarea
              placeholder="Explain why this request is being rejected..."
              value={rejectionReason}
              onChange={(e) => onRejectionReasonChange(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={onReject} className="flex-1">
              Reject Request
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
