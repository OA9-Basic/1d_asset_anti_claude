'use client';

import { motion } from 'framer-motion';
import {
  Loader2,
  Users,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { buttonTap, hoverLift, staggerContainer, staggerItem } from '@/lib/animations';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';
import type { IconType } from '@/types/ui';

interface DashboardStats {
  totalUsers: number;
  totalAssets: number;
  totalRevenue: number;
  pendingRequests: number;
  activeContributions: number;
  pendingWithdrawals: number;
}

interface AssetRequest {
  id: string;
  title: string;
  type: string;
  estimatedPrice: number;
  status: string;
  user: { firstName: string | null; email: string };
  upvotes: number;
  downvotes: number;
  score: number;
  sourceUrl: string;
  thumbnail: string | null;
  description: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  cryptoCurrency: string;
  walletAddress: string;
  status: string;
  user: { firstName: string | null; email: string };
  createdAt: string;
}

interface FundedAsset {
  id: string;
  title: string;
  targetPrice: number;
  currentCollected: number;
  status: string;
  type: string;
  thumbnail: string | null;
  contributorCount: number;
  isFullyFunded: boolean;
}

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  delay,
}: {
  icon: IconType;
  title: string;
  value: string | number;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={staggerItem}
      {...hoverLift}
      className="group"
    >
      <Card className="border-2 card-hover overflow-hidden h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow"
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <motion.p
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (delay || 0) + 0.2 }}
              className="text-3xl font-bold text-gradient"
            >
              {value}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAssets: 0,
    totalRevenue: 0,
    pendingRequests: 0,
    activeContributions: 0,
    pendingWithdrawals: 0,
  });
  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [fundedAssets, setFundedAssets] = useState<FundedAsset[]>([]);

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<FundedAsset | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [platformFee, setPlatformFee] = useState('15');
  const [platformFeeAfterExcess, setPlatformFeeAfterExcess] = useState('100');
  const [profitDistributionTiming, setProfitDistributionTiming] = useState<'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'>('IMMEDIATE');
  const [customDistributionInterval, setCustomDistributionInterval] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveryUrl: '',
    streamUrl: '',
    deliveryKey: '',
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Admin access required',
      });
    }
  }, [user, router, toast]);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes, withdrawalsRes, assetsRes] = await Promise.all([
        fetch('/api/asset-requests'),
        fetch('/api/admin/withdrawals'),
        fetch('/api/admin/assets/funded'),
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setAssetRequests(data.requests || []);
        setStats((prev) => ({
          ...prev,
          pendingRequests:
            data.requests?.filter((r: AssetRequest) => r.status === 'PENDING').length || 0,
        }));
      }

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setWithdrawals(data.withdrawals || []);
        setStats((prev) => ({
          ...prev,
          pendingWithdrawals:
            data.withdrawals?.filter((w: Withdrawal) => w.status === 'PENDING').length || 0,
        }));
      }

      if (assetsRes.ok) {
        const data = await assetsRes.json();
        setFundedAssets(data.assets || []);
        setStats((prev) => ({
          ...prev,
          activeContributions:
            data.assets?.filter((a: FundedAsset) => a.status === 'PURCHASED').length || 0,
        }));
      }

      // Get user and asset counts
      const [usersCount, assetsCount] = await Promise.all([
        fetch('/api/admin/stats/users'),
        fetch('/api/admin/stats/assets'),
      ]);

      if (usersCount.ok) {
        const data = await usersCount.json();
        setStats((prev) => ({ ...prev, totalUsers: data.count || 0 }));
      }

      if (assetsCount.ok) {
        const data = await assetsCount.json();
        setStats((prev) => ({
          ...prev,
          totalAssets: data.count || 0,
          totalRevenue: data.revenue || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [user]);

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;

    try {
      const res = await fetch(`/api/admin/asset-requests/${selectedRequest.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformFee: parseFloat(platformFee) / 100,
          platformFeeAfterExcess: parseFloat(platformFeeAfterExcess) / 100,
          profitDistributionTiming,
          customDistributionInterval: profitDistributionTiming === 'CUSTOM'
            ? parseInt(customDistributionInterval)
            : null,
          featured: false,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Request Approved',
          description: 'Asset has been added to the platform',
        });
        setApproveDialogOpen(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Approval Failed',
          description: data.error || 'Failed to approve request',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process approval',
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;

    try {
      const res = await fetch(`/api/admin/asset-requests/${selectedRequest.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: rejectReason }),
      });

      if (res.ok) {
        toast({
          title: 'Request Rejected',
          description: 'Asset request has been rejected',
        });
        setRejectDialogOpen(false);
        setRejectReason('');
        fetchDashboardData();
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject request',
      });
    }
  };

  const handleStartVoting = async (requestId: string) => {
    try {
      const res = await fetch(`/api/admin/asset-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VOTING' }),
      });

      if (res.ok) {
        toast({
          title: 'Voting Started',
          description: 'Community can now vote on this request',
        });
        fetchDashboardData();
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to start voting',
      });
    }
  };

  const handleWithdrawalAction = async (
    withdrawalId: string,
    action: 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  ) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        toast({
          title: 'Withdrawal Updated',
          description: `Status changed to ${action.toLowerCase()}`,
        });
        fetchDashboardData();
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update withdrawal',
      });
    }
  };

  const handleProcessAsset = async () => {
    if (!selectedAsset) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/assets/${selectedAsset.id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryData),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: 'Asset Processed Successfully',
          description: data.message,
        });
        setProcessDialogOpen(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Processing Failed',
          description: data.error || 'Failed to process asset',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process asset',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-black"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-b bg-background/95 backdrop-blur sticky top-0 z-10"
      >
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-gradient">Admin Dashboard</span>
              </h1>
              <p className="text-muted-foreground">Manage and monitor the platform</p>
            </div>
            <motion.div {...buttonTap}>
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 px-3 py-1 shadow-md">
                <Zap className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="container-custom py-8 space-y-8">
        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              icon={Users}
              title="Total Users"
              value={stats.totalUsers}
              description="Registered users"
              delay={0}
            />
            <StatCard
              icon={Package}
              title="Total Assets"
              value={stats.totalAssets}
              description="Assets on platform"
              delay={0.1}
            />
            <StatCard
              icon={DollarSign}
              title="Total Revenue"
              value={`$${prismaDecimalToNumber(stats.totalRevenue).toFixed(2)}`}
              description="Lifetime revenue"
              delay={0.2}
            />
            <StatCard
              icon={Activity}
              title="Pending Tasks"
              value={stats.pendingRequests + stats.pendingWithdrawals}
              description={`${stats.pendingRequests} requests + ${stats.pendingWithdrawals} withdrawals`}
              delay={0.3}
            />
          </motion.div>
        </motion.section>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="requests" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="requests">Asset Requests</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="funded">Funded Assets</TabsTrigger>
              <TabsTrigger value="assets">All Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              <Card className="border-2">
              <CardHeader>
                <CardTitle>Asset Requests</CardTitle>
                <CardDescription>Review and manage community asset requests</CardDescription>
              </CardHeader>
              <CardContent>
                {assetRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
                      {assetRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <p className="font-medium">{request.title}</p>
                            <p className="text-xs text-muted-foreground">{request.user.email}</p>
                          </TableCell>
                          <TableCell>{request.type}</TableCell>
                          <TableCell>${prismaDecimalToNumber(request.estimatedPrice).toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={request.score >= 0 ? 'text-green-600' : 'text-red-600'}
                            >
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartVoting(request.id)}
                                  >
                                    Start Voting
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setApproveDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setRejectDialogOpen(true);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {request.status === 'VOTING' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setApproveDialogOpen(true);
                                  }}
                                >
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Process user withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
                                  onClick={() =>
                                    handleWithdrawalAction(withdrawal.id, 'PROCESSING')
                                  }
                                >
                                  Processing
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleWithdrawalAction(withdrawal.id, 'COMPLETED')}
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleWithdrawalAction(withdrawal.id, 'REJECTED')}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funded">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Funded Assets - Ready to Process</CardTitle>
                <CardDescription>
                  Assets that have reached their funding goal. Purchase and process to give
                  contributors access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fundedAssets.filter((a) => a.status === 'PURCHASED').length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
                      {fundedAssets
                        .filter((a) => a.status === 'PURCHASED')
                        .map((asset) => (
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
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setProcessDialogOpen(true);
                                  }}
                                >
                                  Process Asset
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Platform Assets</CardTitle>
                <CardDescription>Manage all assets on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Asset management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Asset Request</DialogTitle>
            <DialogDescription>
              Add &quot;{selectedRequest?.title}&quot; to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform Fee During Refund (%)</Label>
              <Input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
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
                onChange={(e) => setPlatformFeeAfterExcess(e.target.value)}
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
              <Select value={profitDistributionTiming} onValueChange={(v: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM') => setProfitDistributionTiming(v)}>
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
              <p className="text-xs text-muted-foreground">
                When to distribute profits to investors
              </p>
            </div>
            {profitDistributionTiming === 'CUSTOM' && (
              <div className="space-y-2">
                <Label>Custom Interval (hours)</Label>
                <Input
                  type="number"
                  value={customDistributionInterval}
                  onChange={(e) => setCustomDistributionInterval(e.target.value)}
                  min="1"
                  max="8760"
                  step="1"
                  placeholder="e.g., 6 for every 6 hours"
                />
                <p className="text-xs text-muted-foreground">
                  How often to distribute profits in hours
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <motion.div {...buttonTap} className="flex-1">
                <Button onClick={handleApproveRequest} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Add Asset
                </Button>
              </motion.div>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Asset Request</DialogTitle>
            <DialogDescription>Reject &quot;{selectedRequest?.title}&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Explain why this request is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" onClick={handleRejectRequest} className="flex-1">
                Reject Request
              </Button>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Process Asset Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Funded Asset</DialogTitle>
            <DialogDescription>
              Process &quot;{selectedAsset?.title}&quot; after purchasing the actual product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
              <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                Before processing:
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Purchase the actual course/product using the collected funds</li>
                <li>Get the delivery URL/access credentials</li>
                <li>Update the asset with delivery information</li>
                <li>Click &quot;Process Asset&quot; to give contributors access</li>
              </ol>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Asset:</strong> {selectedAsset?.title}
              </p>
              <p>
                <strong>Target Price:</strong> ${selectedAsset ? prismaDecimalToNumber(selectedAsset.targetPrice).toFixed(2) : '0.00'}
              </p>
              <p>
                <strong>Collected:</strong> ${selectedAsset ? prismaDecimalToNumber(selectedAsset.currentCollected).toFixed(2) : '0.00'}
              </p>
              <p className="text-muted-foreground">
                Contributors will receive access to the asset. Any excess contributions will be
                refunded to their withdrawable balance.
              </p>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-sm">Delivery Information (Optional)</h4>
              <div className="space-y-2">
                <Label>Download URL</Label>
                <Input
                  placeholder="https://example.com/download.zip"
                  value={deliveryData.deliveryUrl}
                  onChange={(e) =>
                    setDeliveryData((prev) => ({ ...prev, deliveryUrl: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Stream URL</Label>
                <Input
                  placeholder="https://vimeo.com/..."
                  value={deliveryData.streamUrl}
                  onChange={(e) =>
                    setDeliveryData((prev) => ({ ...prev, streamUrl: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Access Key / Password</Label>
                <Input
                  placeholder="Secret key for access"
                  value={deliveryData.deliveryKey}
                  onChange={(e) =>
                    setDeliveryData((prev) => ({ ...prev, deliveryKey: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleProcessAsset} className="flex-1" disabled={isProcessing}>
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Process Asset
              </Button>
              <Button
                variant="outline"
                onClick={() => setProcessDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </motion.div>
    );
  }
