'use client';

import { CheckCircle, XCircle } from 'lucide-react';
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
import type { AssetRequest } from '../types';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

interface AssetRequestsTabProps {
  requests: AssetRequest[];
  onStartVoting: (requestId: string) => void;
  onApprove: (request: AssetRequest) => void;
  onReject: (request: AssetRequest) => void;
}

export function AssetRequestsTab({
  requests,
  onStartVoting,
  onApprove,
  onReject,
}: AssetRequestsTabProps) {
  return (
    <div className="border-2 rounded-xl bg-card">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Asset Requests</h3>
        <p className="text-sm text-muted-foreground">Review and manage community asset requests</p>
      </div>
      <div className="p-6">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No asset requests to review</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <p className="font-medium">{request.title}</p>
                    <p className="text-xs text-muted-foreground">{request.user.email}</p>
                  </TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>${prismaDecimalToNumber(request.estimatedPrice).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={request.score >= 0 ? 'text-green-600' : 'text-red-600'}>
                      +{request.upvotes} / -{request.downvotes}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === 'APPROVED'
                          ? 'default'
                          : request.status === 'VOTING'
                            ? 'secondary'
                            : request.status === 'REJECTED'
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {request.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {request.status === 'PENDING' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => onStartVoting(request.id)}>
                            Start Voting
                          </Button>
                          <Button size="sm" onClick={() => onApprove(request)}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onReject(request)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {request.status === 'VOTING' && (
                        <Button size="sm" onClick={() => onApprove(request)}>
                          Approve
                        </Button>
                      )}
                    </div>
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
