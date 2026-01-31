'use client';

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
import type { Withdrawal } from '../types';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

interface WithdrawalsTabProps {
  withdrawals: Withdrawal[];
  onAction: (withdrawalId: string, action: 'PROCESSING' | 'COMPLETED' | 'REJECTED') => void;
}

export function WithdrawalsTab({ withdrawals, onAction }: WithdrawalsTabProps) {
  return (
    <div className="border-2 rounded-xl bg-card">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Withdrawal Requests</h3>
        <p className="text-sm text-muted-foreground">Process user withdrawal requests</p>
      </div>
      <div className="p-6">
        {withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No withdrawal requests</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <p>{withdrawal.user.firstName || withdrawal.user.email}</p>
                    <p className="text-xs text-muted-foreground">{withdrawal.user.email}</p>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${prismaDecimalToNumber(withdrawal.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{withdrawal.cryptoCurrency}</TableCell>
                  <TableCell className="text-sm font-mono">
                    {withdrawal.walletAddress.slice(0, 10)}...
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        withdrawal.status === 'COMPLETED'
                          ? 'default'
                          : withdrawal.status === 'PROCESSING'
                            ? 'secondary'
                            : withdrawal.status === 'REJECTED'
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {withdrawal.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {withdrawal.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAction(withdrawal.id, 'PROCESSING')}
                        >
                          Processing
                        </Button>
                        <Button size="sm" onClick={() => onAction(withdrawal.id, 'COMPLETED')}>
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onAction(withdrawal.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </div>
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
