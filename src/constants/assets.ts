/**
 * Asset Types Configuration
 */

export const ASSET_TYPES = [
  { value: 'COURSE', label: 'Course', icon: '📚' },
  { value: 'AI_MODEL', label: 'AI Model', icon: '🤖' },
  { value: 'SAAS', label: 'SaaS', icon: '☁️' },
  { value: 'SOFTWARE', label: 'Software', icon: '💻' },
  { value: 'TEMPLATE', label: 'Template', icon: '📄' },
  { value: 'CODE', label: 'Code', icon: '⌨️' },
  { value: 'MODEL_3D', label: '3D Model', icon: '🎨' },
  { value: 'EBOOK', label: 'E-Book', icon: '📖' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
] as const;

export type AssetType = typeof ASSET_TYPES[number]['value'];

/**
 * Delivery Types Configuration
 */
export const DELIVERY_TYPES = [
  { value: 'DOWNLOAD', label: 'Download', icon: '⬇️' },
  { value: 'STREAM', label: 'Stream', icon: '▶️' },
  { value: 'EXTERNAL', label: 'External', icon: '🔗' },
  { value: 'HYBRID', label: 'Hybrid', icon: '🔀' },
] as const;

export type DeliveryType = typeof DELIVERY_TYPES[number]['value'];

/**
 * Asset Status Configuration
 */
export const ASSET_STATUS = {
  REQUESTED: { value: 'REQUESTED', label: 'Requested', color: 'bg-gray-100 text-gray-800' },
  APPROVED: { value: 'APPROVED', label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  COLLECTING: { value: 'COLLECTING', label: 'Funding', color: 'bg-yellow-100 text-yellow-800' },
  PURCHASED: { value: 'PURCHASED', label: 'Purchased', color: 'bg-purple-100 text-purple-800' },
  AVAILABLE: { value: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-800' },
  PAUSED: { value: 'PAUSED', label: 'Paused', color: 'bg-orange-100 text-orange-800' },
  REJECTED: { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
} as const;

export type AssetStatus = typeof ASSET_STATUS[keyof typeof ASSET_STATUS]['value'];

/**
 * Price Ranges Configuration
 */
export const PRICE_RANGES = [
  { value: '0-50', label: 'Under $50', min: 0, max: 50 },
  { value: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { value: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { value: '200-500', label: '$200 - $500', min: 200, max: 500 },
  { value: '500+', label: '$500+', min: 500, max: Infinity },
] as const;

/**
 * Sort Options Configuration
 */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: '🕐' },
  { value: 'mostPurchased', label: 'Most Purchased', icon: '🔥' },
  { value: 'trending', label: 'Trending', icon: '📈' },
  { value: 'priceAsc', label: 'Price: Low to High', icon: '💰' },
  { value: 'priceDesc', label: 'Price: High to Low', icon: '💎' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];
