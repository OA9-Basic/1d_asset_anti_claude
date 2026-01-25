/**
 * Type definitions for profit distribution system
 */

export interface AssetGroupData {
  asset: {
    id: string;
    title: string;
    thumbnail: string | null;
  };
  totalReceived: number;
  shareCount: number;
  shares: Array<{
    amount: number;
    ratio: number;
    date: Date;
  }>;
}
