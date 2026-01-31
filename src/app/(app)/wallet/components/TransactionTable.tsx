'use client';

import { Calendar, Wallet as WalletIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransactionType } from './TransactionType';
import { TransactionStatus } from './TransactionStatus';
import type { Transaction } from '../types';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

interface TransactionTableProps {
  transactions: Transaction[];
  transactionsLoading: boolean;
}

export function TransactionTable({ transactions, transactionsLoading }: TransactionTableProps) {
  return (
    <Card className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      <CardContent className="p-0">
        {transactionsLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                  <TableHead className="text-center font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TransactionType type={transaction.type} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-neutral-600 dark:text-neutral-400">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          transaction.type === 'DEPOSIT' ||
                          transaction.type === 'PROFIT_SHARE' ||
                          transaction.type === 'CONTRIBUTION_REFUND'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-900 dark:text-white'
                        }`}
                      >
                        {transaction.type === 'DEPOSIT' ||
                        transaction.type === 'PROFIT_SHARE' ||
                        transaction.type === 'CONTRIBUTION_REFUND'
                          ? '+'
                          : ''}
                        ${prismaDecimalToNumber(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <TransactionStatus status={transaction.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 font-medium">No transactions found</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
