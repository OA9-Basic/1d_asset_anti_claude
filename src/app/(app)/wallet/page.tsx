'use client';

import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet as WalletIcon,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BalanceData {
  balance: number;
  withdrawableBalance: number;
  storeCredit: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalContributed: number;
  totalProfitReceived: number;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface TransactionsData {
  transactions: Transaction[];
}

// Transaction Status Badge
function TransactionStatus({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
    COMPLETED: {
      label: 'Success',
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
      icon: CheckCircle2,
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
      icon: Clock,
    },
    FAILED: {
      label: 'Failed',
      className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900/50',
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <StatusIcon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}

// Transaction Type Badge
function TransactionType({ type }: { type: string }) {
  const typeConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
    DEPOSIT: {
      label: 'Deposit',
      className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
      icon: ArrowDownCircle,
    },
    WITHDRAWAL: {
      label: 'Withdrawal',
      className: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
      icon: ArrowUpCircle,
    },
    WITHDRAWAL_REQUEST: {
      label: 'Withdrawal Request',
      className: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30',
      icon: Clock,
    },
    CONTRIBUTION: {
      label: 'Contribution',
      className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
      icon: TrendingUp,
    },
    CONTRIBUTION_REFUND: {
      label: 'Refund',
      className: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
      icon: TrendingDown,
    },
    PROFIT_SHARE: {
      label: 'Profit',
      className: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30',
      icon: DollarSign,
    },
    PURCHASE: {
      label: 'Purchase',
      className: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30',
      icon: CheckCircle2,
    },
  };

  const config = typeConfig[type] || {
    label: type,
    className: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950/30',
    icon: DollarSign,
  };
  const TypeIcon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${config.className}`}>
        <TypeIcon className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
}

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
      {/* Header */}
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
            {/* Balance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Balance */}
              <Card className="border-2 border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900">
                      <WalletIcon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                    </div>
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 rounded-full">
                      Primary
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Total Balance</p>
                  {balanceLoading ? (
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      ${balanceData ? prismaDecimalToNumber(balanceData.balance).toFixed(2) : '0.00'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Withdrawable */}
              <Card className="border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Withdrawable</p>
                  {balanceLoading ? (
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      ${balanceData ? prismaDecimalToNumber(balanceData.withdrawableBalance).toFixed(2) : '0.00'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Store Credit */}
              <Card className="border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30">
                      <WalletIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Store Credit</p>
                  {balanceLoading ? (
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      ${balanceData ? prismaDecimalToNumber(balanceData.storeCredit).toFixed(2) : '0.00'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Total Deposited */}
              <Card className="border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                      <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">Total Deposited</p>
                  {balanceLoading ? (
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                      ${balanceData ? prismaDecimalToNumber(balanceData.totalDeposited).toFixed(2) : '0.00'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => router.push('/wallet/deposit')}
                className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 text-left hover:border-neutral-900 dark:hover:border-white transition-all duration-300 shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 group-hover:scale-110 transition-transform duration-300">
                      <ArrowDownCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Deposit Funds
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Add funds using cryptocurrency
                  </p>
                </div>
              </button>

              <button
                onClick={() => setWithdrawOpen(true)}
                className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 text-left hover:border-neutral-900 dark:hover:border-white transition-all duration-300 shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 group-hover:scale-110 transition-transform duration-300">
                      <ArrowUpCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Withdraw Funds
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Request withdrawal to crypto
                  </p>
                </div>
              </button>
            </div>

            {/* Transaction History */}
            <Card className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
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
              <CardContent className="p-0">
                {transactionsLoading ? (
                  <div className="p-8 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
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
                        {filteredTransactions.map((transaction) => (
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
          </>
        )}
      </div>

      {/* Withdraw Dialog */}
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
