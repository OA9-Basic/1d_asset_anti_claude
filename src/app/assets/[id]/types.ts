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
  sourceUrl: string | null;
  deliveryUrl: string | null;
  createdAt: string;
}

export interface Contribution {
  id: string;
  userId: string;
  amount: number;
  excessAmount: number;
  totalProfitReceived: number;
  isInvestment: boolean;
  createdAt: string;
  user: {
    email: string;
    firstName: string | null;
  };
}

export interface Purchase {
  id: string;
  userId: string;
  purchaseAmount: number;
  createdAt: string;
  user: {
    email: string;
    firstName: string | null;
  };
}

export interface AssetData {
  asset: Asset;
  contributions: Contribution[];
  purchases: Purchase[];
  userContribution: Contribution | null;
  userPurchase: Purchase | null;
  hasAccess: boolean;
  accessType: string | null;
}

export interface RelatedAsset {
  id: string;
  title: string;
  type: string;
  status: string;
  thumbnail: string | null;
  totalPurchases: number;
}
