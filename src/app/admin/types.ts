export interface DashboardStats {
  totalUsers: number;
  totalAssets: number;
  totalRevenue: number;
  pendingRequests: number;
  activeContributions: number;
  pendingWithdrawals: number;
}

export interface AssetRequest {
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

export interface Withdrawal {
  id: string;
  amount: number;
  cryptoCurrency: string;
  walletAddress: string;
  status: string;
  user: { firstName: string | null; email: string };
  createdAt: string;
}

export interface FundedAsset {
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

export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  description: string;
  delay?: number;
}
