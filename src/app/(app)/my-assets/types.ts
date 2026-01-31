export interface Asset {
  id: string;
  title: string;
  description: string;
  type: string;
  deliveryType: string;
  targetPrice: number;
  platformFee: number;
  currentCollected: number;
  status: string;
  totalPurchases: number;
  totalRevenue: number;
  thumbnail: string | null;
  featured: boolean;
  relationship: 'contributing' | 'owned' | 'both';
  userContribution?: number;
  userExcessAmount?: number;
  profitShareRatio?: number;
  totalProfitReceived?: number;
  purchaseAmount?: number;
  deliveryAccessKey?: string | null;
  deliveryExpiry?: string | null;
  accessCount?: number;
  lastAccessedAt?: string | null;
  purchasedAt?: string;
  contributionId?: string;
  purchaseId?: string;
  progressPercent: number;
  remainingAmount: number;
  targetWithFee: number;
  createdAt: string;
}

export interface MyAssetsData {
  assets: Asset[];
  stats: {
    totalInvested: number;
    assetsOwned: number;
    contributingCount: number;
    ownedCount: number;
    completedCount: number;
  };
}

export const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  REQUESTED: {
    label: 'Requested',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: 'Clock',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: 'CheckCircle2',
  },
  COLLECTING: {
    label: 'Funding',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: 'Clock',
  },
  PURCHASED: {
    label: 'Purchased',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: 'CheckCircle2',
  },
  AVAILABLE: {
    label: 'Available',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: 'ShoppingCart',
  },
  PAUSED: {
    label: 'Paused',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: 'Clock',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: 'Clock',
  },
};
