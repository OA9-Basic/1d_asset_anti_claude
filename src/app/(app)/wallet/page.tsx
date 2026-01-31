'use client';

import { RefreshCw, Loader2, Filter, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import { BalanceCards } from './components/BalanceCards';
import { TransactionTable } from './components/TransactionTable';
import { WalletActions } from './components/WalletActions';
import type { BalanceData, TransactionsData } from './types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WalletPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [cryptoCurrency, setCryptoCurrency] = useState('ETH');
  const [walletAddress, setWalletAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const {
    data: balanceData,
    error: balanceError,
    isLoading: balanceLoading,
    mutate: mutateBalance,
  } = useSWR<BalanceData>(user ? '/api/wallet/balance' : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const {
    data: transactionsData,
    error: transactionsError,
    isLoading: transactionsLoading,
    mutate: mutateTransactions,
  } = useSWR<TransactionsData>(user ? '/api/wallet/transactions' : null, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, authLoading, router]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !walletAddress) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          cryptoCurrency,
          walletAddress,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setWithdrawOpen(false);
        setWithdrawAmount('');
        setWalletAddress('');
        mutateBalance();
        mutateTransactions();
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch {
      alert('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTransactions =
    transactionsData?.transactions?.filter((tx) => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      return true;
    }) || [];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-neutral-900 dark:bg-white" />
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                  Wallet
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Manage your funds
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                mutateBalance();
                mutateTransactions();
              }}
              disabled={balanceLoading || transactionsLoading}
              className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${balanceLoading || transactionsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {balanceError || transactionsError ? (
          <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Failed to load wallet data</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      mutateBalance();
                      mutateTransactions();
                    }}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <BalanceCards balanceData={balanceData} balanceLoading={balanceLoading} />
            <WalletActions onWithdrawClick={() => setWithdrawOpen(true)} />

            <Card className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                      Transaction History
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Your recent wallet activity
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px] border-neutral-200 dark:border-neutral-800">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="DEPOSIT">Deposits</SelectItem>
                        <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                        <SelectItem value="CONTRIBUTION">Contributions</SelectItem>
                        <SelectItem value="PROFIT_SHARE">Profits</SelectItem>
                        <SelectItem value="PURCHASE">Purchases</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] border-neutral-200 dark:border-neutral-800">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <TransactionTable transactions={filteredTransactions} transactionsLoading={transactionsLoading} />
            </Card>
          </>
        )}
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md border-neutral-200 dark:border-neutral-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw funds from your wallet to cryptocurrency
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Amount (USD)
              </span>
              <Input
                type="number"
                placeholder="100.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                step="0.01"
                className="border-neutral-200 dark:border-neutral-800"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Available: ${balanceData ? prismaDecimalToNumber(balanceData.withdrawableBalance).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="space-y-2">
              <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Cryptocurrency
              </span>
              <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                <SelectTrigger className="border-neutral-200 dark:border-neutral-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <span className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Wallet Address
              </span>
              <Input
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="border-neutral-200 dark:border-neutral-800"
              />
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Withdrawal Request</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Your withdrawal will be processed by an admin. Funds will be locked until approval.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)} className="border-neutral-200 dark:border-neutral-800">
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                isProcessing ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) <= 0 ||
                !walletAddress
              }
              className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
