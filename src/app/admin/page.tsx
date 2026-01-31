'use client';

import { motion } from 'framer-motion';
import { Loader2, Users, DollarSign, Package, Activity, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { buttonTap, staggerContainer } from '@/lib/animations';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

import { StatCard } from './components/StatCard';
import { AssetRequestsTab } from './components/AssetRequestsTab';
import { WithdrawalsTab } from './components/WithdrawalsTab';
import { FundedAssetsTab } from './components/FundedAssetsTab';
import { ApproveRequestDialog } from './components/ApproveRequestDialog';
import { RejectRequestDialog } from './components/RejectRequestDialog';
import { ProcessAssetDialog } from './components/ProcessAssetDialog';
import type { DashboardStats, AssetRequest, Withdrawal, FundedAsset } from './types';

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
          pendingRequests: data.requests?.filter((r: AssetRequest) => r.status === 'PENDING').length || 0,
        }));
      }

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setWithdrawals(data.withdrawals || []);
        setStats((prev) => ({
          ...prev,
          pendingWithdrawals: data.withdrawals?.filter((w: Withdrawal) => w.status === 'PENDING').length || 0,
        }));
      }

      if (assetsRes.ok) {
        const data = await assetsRes.json();
        setFundedAssets(data.assets || []);
        setStats((prev) => ({
          ...prev,
          activeContributions: data.assets?.filter((a: FundedAsset) => a.status === 'PURCHASED').length || 0,
        }));
      }

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
        toast({ title: 'Request Approved', description: 'Asset has been added to the platform' });
        setApproveDialogOpen(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        toast({ variant: 'destructive', title: 'Approval Failed', description: data.error || 'Failed to approve request' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process approval' });
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
        toast({ title: 'Request Rejected', description: 'Asset request has been rejected' });
        setRejectDialogOpen(false);
        setRejectReason('');
        fetchDashboardData();
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject request' });
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
        toast({ title: 'Voting Started', description: 'Community can now vote on this request' });
        fetchDashboardData();
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to start voting' });
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
        toast({ title: 'Withdrawal Updated', description: `Status changed to ${action.toLowerCase()}` });
        fetchDashboardData();
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update withdrawal' });
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
        toast({ title: 'Asset Processed Successfully', description: data.message });
        setProcessDialogOpen(false);
        fetchDashboardData();
      } else {
        const data = await res.json();
        toast({ variant: 'destructive', title: 'Processing Failed', description: data.error || 'Failed to process asset' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process asset' });
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white dark:bg-black">
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
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} title="Total Users" value={stats.totalUsers} description="Registered users" />
            <StatCard icon={Package} title="Total Assets" value={stats.totalAssets} description="Assets on platform" />
            <StatCard icon={DollarSign} title="Total Revenue" value={`$${prismaDecimalToNumber(stats.totalRevenue).toFixed(2)}`} description="Lifetime revenue" />
            <StatCard icon={Activity} title="Pending Tasks" value={stats.pendingRequests + stats.pendingWithdrawals} description={`${stats.pendingRequests} requests + ${stats.pendingWithdrawals} withdrawals`} />
          </motion.div>
        </motion.section>

        {/* Main Content Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Tabs defaultValue="requests" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger value="requests">Asset Requests</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="funded">Funded Assets</TabsTrigger>
              <TabsTrigger value="assets">All Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              <AssetRequestsTab
                requests={assetRequests}
                onStartVoting={handleStartVoting}
                onApprove={(request) => {
                  setSelectedRequest(request);
                  setApproveDialogOpen(true);
                }}
                onReject={(request) => {
                  setSelectedRequest(request);
                  setRejectDialogOpen(true);
                }}
              />
            </TabsContent>

            <TabsContent value="withdrawals">
              <WithdrawalsTab withdrawals={withdrawals} onAction={handleWithdrawalAction} />
            </TabsContent>

            <TabsContent value="funded">
              <FundedAssetsTab
                assets={fundedAssets}
                onProcess={(asset) => {
                  setSelectedAsset(asset);
                  setProcessDialogOpen(true);
                }}
              />
            </TabsContent>

            <TabsContent value="assets">
              <div className="border-2 rounded-xl bg-card p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Asset management coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Dialogs */}
      <ApproveRequestDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        request={selectedRequest}
        platformFee={platformFee}
        onPlatformFeeChange={setPlatformFee}
        platformFeeAfterExcess={platformFeeAfterExcess}
        onPlatformFeeAfterExcessChange={setPlatformFeeAfterExcess}
        profitDistributionTiming={profitDistributionTiming}
        onProfitDistributionTimingChange={setProfitDistributionTiming}
        customDistributionInterval={customDistributionInterval}
        onCustomDistributionIntervalChange={setCustomDistributionInterval}
        onApprove={handleApproveRequest}
        isProcessing={isProcessing}
      />

      <RejectRequestDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        requestTitle={selectedRequest?.title}
        rejectionReason={rejectReason}
        onRejectionReasonChange={setRejectReason}
        onReject={handleRejectRequest}
      />

      <ProcessAssetDialog
        open={processDialogOpen}
        onOpenChange={setProcessDialogOpen}
        asset={selectedAsset}
        deliveryData={deliveryData}
        onDeliveryDataChange={setDeliveryData}
        onProcess={handleProcessAsset}
        isProcessing={isProcessing}
      />
    </motion.div>
  );
}
