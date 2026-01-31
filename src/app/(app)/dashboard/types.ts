export interface DashboardStats {
  totalContributed: number;
  activeVotes: number;
  assetsOwned: number;
  walletBalance: number;
  withdrawableBalance: number;
  storeCredit: number;
}

export interface Contribution {
  id: string;
  amount: number;
  assetId: string;
  createdAt: string;
  asset: {
    id: string;
    title: string;
    thumbnail: string | null;
    type: string;
    status: string;
  };
}

export interface ActivityItem {
  id: string;
  type: string;
  amount: number;
  user: {
    id: string;
    name: string;
  };
  asset: {
    id: string;
    title: string;
    type: string;
    thumbnail: string | null;
  };
  createdAt: string;
}

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
}

export interface Purchase {
  id: string;
  amount: number;
  createdAt: string;
  asset: {
    id: string;
    title: string;
    thumbnail: string | null;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  contributions: Contribution[];
  purchases: Purchase[];
  recentActivity: ActivityItem[];
  votes: Vote[];
}

export interface FeaturedAssetsData {
  assets: Asset[];
}

export interface Vote {
  id: string;
  assetRequest: {
    id: string;
    title: string;
  };
  voteType: string;
  createdAt: string;
}
