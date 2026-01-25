'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard as CreditCardIcon,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  buttonTap,
  hoverLift,
  modalScaleUp,
  modalFadeIn,
} from '@/lib/animations'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface BalanceData {
  balance: number
  withdrawableBalance: number
  storeCredit: number
  totalDeposited: number
  totalWithdrawn: number
  totalContributed: number
  totalProfitReceived: number
}

interface Transaction {
  id: string
  type: string
  status: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  createdAt: string
}

interface TransactionsData {
  transactions: Transaction[]
}

// Credit Card Visual Component
function CreditCard({ balance, user }: { balance: number; user: any }) {
  const [showNumber, setShowNumber] = useState(false)

  // Generate a mock card number based on user ID
  const cardNumber = showNumber ? '4532 •••• •••• 1234' : '•••• •••• •••• ••••'
  const lastFour = '1234'
  const expiryDate = '12/28'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
      className="relative"
    >
      <div className="relative w-full max-w-md mx-auto">
        {/* Card Glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur-lg"
        />

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{ x: [0, 50, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"
            />
            <motion.div
              animate={{ x: [0, -50, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"
            />
          </div>

          {/* Chip */}
          <motion.div
            className="absolute top-8 right-8"
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md flex items-center justify-center shadow-lg">
              <div className="w-8 h-6 border border-yellow-600/30 rounded-sm" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="relative z-10 space-y-8">
            {/* Balance Display */}
            <div>
              <p className="text-violet-100 text-sm font-medium mb-1">Total Balance</p>
              <motion.p
                key={balance}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-4xl font-bold text-white tracking-tight"
              >
                ${balance.toFixed(2)}
              </motion.p>
            </div>

            {/* Card Number */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-xs font-medium mb-2">Card Number</p>
                <div className="flex items-center gap-6">
                  <p className="text-xl text-white tracking-widest font-mono">
                    {cardNumber}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNumber(!showNumber)}
                    className="text-violet-200 hover:text-white transition-colors"
                  >
                    {showNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <div>
                <p className="text-violet-100 text-xs font-medium mb-1">Card Holder</p>
                <p className="text-white font-medium uppercase tracking-wide">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-violet-100 text-xs font-medium mb-1">Expires</p>
                <p className="text-white font-medium tracking-wide">{expiryDate}</p>
              </div>
            </div>
          </div>

          {/* Card Type Badge */}
          <div className="absolute bottom-8 right-8">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <CreditCardIcon className="w-3 h-3 mr-1" />
                VISA
              </Badge>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Transaction Status Badge
function TransactionStatus({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    COMPLETED: {
      label: 'Success',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle2,
    },
    PENDING: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: Clock,
    },
    FAILED: {
      label: 'Failed',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: XCircle,
    },
  }

  const config = statusConfig[status] || statusConfig.PENDING
  const StatusIcon = config.icon

  return (
    <Badge className={config.className}>
      <StatusIcon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  )
}

// Transaction Type Badge
function TransactionType({ type }: { type: string }) {
  const typeConfig: Record<string, { label: string; className: string; icon: any }> = {
    DEPOSIT: {
      label: 'Deposit',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: ArrowDownCircle,
    },
    WITHDRAWAL: {
      label: 'Withdrawal',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: ArrowUpCircle,
    },
    WITHDRAWAL_REQUEST: {
      label: 'Withdrawal Request',
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      icon: Clock,
    },
    CONTRIBUTION: {
      label: 'Contribution',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      icon: TrendingUp,
    },
    CONTRIBUTION_REFUND: {
      label: 'Refund',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      icon: TrendingDown,
    },
    PROFIT_SHARE: {
      label: 'Profit',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      icon: DollarSign,
    },
    PURCHASE: {
      label: 'Purchase',
      className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      icon: CheckCircle2,
    },
  }

  const config = typeConfig[type] || { label: type, className: 'bg-gray-100 text-gray-700', icon: DollarSign }
  const TypeIcon = config.icon

  return (
    <div className="flex items-center gap-2">
      <TypeIcon className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm">{config.label}</span>
    </div>
  )
}

// Stat Row Component
function StatRow({
  label,
  value,
  valueClassName = '',
  delay,
}: {
  label: string
  value: string | number
  valueClassName?: string
  delay?: number
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ x: 4, backgroundColor: 'rgba(var(--muted) / 0.3)' }}
      className="flex items-center justify-between py-3 border-b last:border-0 rounded transition-colors px-2 -mx-2"
    >
      <span className="text-muted-foreground">{label}</span>
      <motion.span
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: (delay || 0) + 0.2 }}
        className={`font-semibold ${valueClassName}`}
      >
        {value}
      </motion.span>
    </motion.div>
  )
}

export default function WalletPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [cryptoCurrency, setCryptoCurrency] = useState('MOCK')
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const { data: balanceData, error: balanceError, isLoading: balanceLoading, mutate: mutateBalance } =
    useSWR<BalanceData>(user ? '/api/wallet/balance' : null, fetcher, {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    })

  const { data: transactionsData, error: transactionsError, isLoading: transactionsLoading, mutate: mutateTransactions } =
    useSWR<TransactionsData>(user ? '/api/wallet/transactions' : null, fetcher, {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/sign-in')
    }
  }, [user, authLoading, router])

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    setIsProcessing(true)
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          cryptoCurrency,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setDepositOpen(false)
        setDepositAmount('')
        mutateBalance()
        mutateTransactions()
      } else {
        alert(data.error || 'Deposit failed')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !walletAddress) return

    setIsProcessing(true)
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          cryptoCurrency,
          walletAddress,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setWithdrawOpen(false)
        setWithdrawAmount('')
        setWalletAddress('')
        mutateBalance()
        mutateTransactions()
      } else {
        alert(data.error || 'Withdrawal failed')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactionsData?.transactions?.filter((tx) => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false
    return true
  }) || []

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-muted/20 to-background"
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b bg-background/95 backdrop-blur sticky top-0 z-10"
      >
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Wallet</h1>
              <p className="text-muted-foreground">Manage your funds and transactions</p>
            </div>
            <motion.div {...buttonTap}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  mutateBalance()
                  mutateTransactions()
                }}
                disabled={balanceLoading || transactionsLoading}
              >
                <motion.div
                  animate={balanceLoading || transactionsLoading ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                </motion.div>
                Refresh
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="container-custom py-8 space-y-8">
        {balanceError || transactionsError ? (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Failed to load wallet data</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      mutateBalance()
                      mutateTransactions()
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
            {/* Credit Card Visual */}
            <section className="flex justify-center">
              {balanceLoading ? (
                <Card className="w-full max-w-md h-64">
                  <CardContent className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : balanceData ? (
                <CreditCard balance={balanceData.balance} user={user} />
              ) : null}
            </section>

            {/* Action Buttons */}
            <section className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                onClick={() => setDepositOpen(true)}
              >
                <ArrowDownCircle className="w-5 h-5 mr-2" />
                Deposit Funds
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30"
                onClick={() => setWithdrawOpen(true)}
              >
                <ArrowUpCircle className="w-5 h-5 mr-2" />
                Withdraw Funds
              </Button>
            </section>

            {/* Balance Breakdown */}
            <section>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Balance Breakdown</CardTitle>
                  <CardDescription>Your wallet balances at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  {balanceLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : balanceData ? (
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                      className="space-y-1"
                    >
                      <StatRow
                        label="Available Balance"
                        value={`$${balanceData.balance.toFixed(2)}`}
                        valueClassName="text-xl text-gradient"
                        delay={0}
                      />
                      <StatRow
                        label="Withdrawable Balance"
                        value={`$${balanceData.withdrawableBalance.toFixed(2)}`}
                        valueClassName="text-green-600"
                        delay={0.1}
                      />
                      <StatRow
                        label="Store Credit"
                        value={`$${balanceData.storeCredit.toFixed(2)}`}
                        valueClassName="text-purple-600"
                        delay={0.2}
                      />
                      <StatRow
                        label="Total Deposited"
                        value={`$${balanceData.totalDeposited.toFixed(2)}`}
                        delay={0.3}
                      />
                      <StatRow
                        label="Total Withdrawn"
                        value={`$${balanceData.totalWithdrawn.toFixed(2)}`}
                        delay={0.4}
                      />
                      <StatRow
                        label="Total Contributed"
                        value={`$${balanceData.totalContributed.toFixed(2)}`}
                        delay={0.5}
                      />
                      <StatRow
                        label="Total Profit Received"
                        value={`$${balanceData.totalProfitReceived.toFixed(2)}`}
                        valueClassName="text-emerald-600"
                        delay={0.6}
                      />
                    </motion.div>
                  ) : null}
                </CardContent>
              </Card>
            </section>

            {/* Transaction History */}
            <section>
              <Card className="border-2">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>Your recent wallet activity</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px]">
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
                        <SelectTrigger className="w-[140px]">
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
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : filteredTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.map((transaction, index) => (
                            <motion.tr
                              key={transaction.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <TransactionType type={transaction.type} />
                              </TableCell>
                              <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={`font-semibold ${
                                    transaction.type === 'DEPOSIT' ||
                                    transaction.type === 'PROFIT_SHARE' ||
                                    transaction.type === 'CONTRIBUTION_REFUND'
                                      ? 'text-green-600'
                                      : transaction.type === 'WITHDRAWAL' ||
                                          transaction.type === 'CONTRIBUTION' ||
                                          transaction.type === 'PURCHASE'
                                        ? 'text-red-600'
                                        : ''
                                  }`}
                                >
                                  {transaction.type === 'DEPOSIT' ||
                                  transaction.type === 'PROFIT_SHARE' ||
                                  transaction.type === 'CONTRIBUTION_REFUND'
                                    ? '+'
                                    : '-'}
                                  ${transaction.amount.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <TransactionStatus status={transaction.status} />
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>

      {/* Deposit Dialog */}
      <AnimatePresence>
        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              variants={modalScaleUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
                <DialogDescription>Add funds to your wallet using cryptocurrency</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="100.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crypto-currency">Cryptocurrency</Label>
              <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                <SelectTrigger id="crypto-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOCK">MOCK (Test Mode)</SelectItem>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  <SelectItem value="XMR">Monero (XMR)</SelectItem>
                  <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                  <SelectItem value="BCH">Bitcoin Cash (BCH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {cryptoCurrency === 'MOCK' && (
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm">
                <p className="font-medium mb-1">Test Mode</p>
                <p className="text-xs">This will add test funds to your wallet for development purposes.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={isProcessing || !depositAmount || parseFloat(depositAmount) <= 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  Deposit
                </>
              )}
            </Button>
          </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>

      {/* Withdraw Dialog */}
      <AnimatePresence>
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogContent className="sm:max-w-md">
            <motion.div
              variants={modalScaleUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>Withdraw funds from your wallet to cryptocurrency</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="100.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Available: ${balanceData?.withdrawableBalance.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-crypto">Cryptocurrency</Label>
              <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                <SelectTrigger id="withdraw-crypto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  <SelectItem value="XMR">Monero (XMR)</SelectItem>
                  <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                  <SelectItem value="BCH">Bitcoin Cash (BCH)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                placeholder="Enter your wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm">
              <p className="font-medium mb-1">Withdrawal Request</p>
              <p className="text-xs">
                Your withdrawal will be processed by an admin. Funds will be locked until approval.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
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
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Withdraw
                </>
              )}
            </Button>
          </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </motion.div>
  )
}
