/**
 * Asset types for API responses
 */

export interface AssetListItem {
  id: string;
  title: string;
  description: string;
  type: string;
  deliveryType: string;
  targetPrice: number;
  platformFee: number | null;
  currentCollected: number;
  status: string;
  totalPurchases: number;
  totalRevenue: number;
  thumbnail: string | null;
  featured: boolean;
  createdAt: string;
  userContribution?: number;
  userExcessAmount?: number;
  profitShareRatio?: number | null;
  totalProfitReceived?: number;
  relationship?: 'contributing' | 'owned' | 'both';
  progressPercent?: number;
  remainingAmount?: number;
  targetWithFee?: number;
  contributionId?: string;
  contributionStatus?: string;
  purchaseAmount?: number;
  deliveryAccessKey?: string | null;
  deliveryExpiry?: string | null;
  accessCount?: number;
  lastAccessedAt?: string | null;
  purchasedAt?: string;
  purchaseId?: string;
}
