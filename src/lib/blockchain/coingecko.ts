/**
 * COINGECKO PRICE SERVICE
 * Real-time cryptocurrency price conversion
 */

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY; // Optional Pro API key

// CoinGecko IDs for supported cryptocurrencies
const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  USDT_POLYGON: 'tether', // USDT has same price across chains
  USDC_POLYGON: 'usd-coin', // USDC has same price across chains
  USDT_BSC: 'tether',
  USDC_BSC: 'usd-coin',
} as const;

export interface CryptoPrice {
  usd: number;
  usd_market_cap?: number;
  usd_24h_change?: number;
  last_updated_at?: string;
}

export interface PriceQuote {
  cryptoAmount: number;
  usdPrice: number;
  exchangeRate: number;
  network: string;
  expiresAt: Date;
}

/**
 * Get current price of a cryptocurrency in USD
 */
export async function getCryptoPrice(
  currency: keyof typeof COIN_IDS
): Promise<CryptoPrice> {
  const coinId = COIN_IDS[currency];

  if (!coinId) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  const url = new URL(`${COINGECKO_API_BASE}/simple/price`);
  url.searchParams.set('ids', coinId);
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_24hr_change', 'true');

  const headers: Record<string, string> = {};
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data[coinId]) {
    throw new Error(`Price data not found for ${currency}`);
  }

  return data[coinId];
}

/**
 * Get multiple crypto prices at once
 */
export async function getMultipleCryptoPrices(
  currencies: (keyof typeof COIN_IDS)[]
): Promise<Record<string, CryptoPrice>> {
  const coinIds = currencies.map(c => COIN_IDS[c]).filter(Boolean);

  const url = new URL(`${COINGECKO_API_BASE}/simple/price`);
  url.searchParams.set('ids', coinIds.join(','));
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_24hr_change', 'true');

  const headers: Record<string, string> = {};
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Convert USD to crypto amount
 */
export async function usdToCrypto(
  usdAmount: number,
  currency: keyof typeof COIN_IDS,
  options?: {
    slippageTolerance?: number; // Default 1% (0.01)
    safetyMargin?: number; // Extra amount to cover price movement
  }
): Promise<PriceQuote> {
  const priceData = await getCryptoPrice(currency);
  const usdPrice = priceData.usd;

  // Calculate base crypto amount
  let cryptoAmount = usdAmount / usdPrice;

  // Add safety margin (default 1%)
  const safetyMargin = options?.safetyMargin ?? 0.01;
  cryptoAmount = cryptoAmount * (1 + safetyMargin);

  // Price quote expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return {
    cryptoAmount,
    usdPrice,
    exchangeRate: usdPrice,
    network: currency,
    expiresAt,
  };
}

/**
 * Convert crypto to USD amount
 */
export async function cryptoToUsd(
  cryptoAmount: number,
  currency: keyof typeof COIN_IDS
): Promise<number> {
  const priceData = await getCryptoPrice(currency);
  return cryptoAmount * priceData.usd;
}

/**
 * Get price with fallback and caching
 * Useful for reducing API calls
 */
const priceCache = new Map<string, { data: CryptoPrice; expiresAt: number }>();

export async function getCachedCryptoPrice(
  currency: keyof typeof COIN_IDS,
  maxAge: number = 60000 // Cache for 1 minute by default
): Promise<CryptoPrice> {
  const cacheKey = currency;
  const cached = priceCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const priceData = await getCryptoPrice(currency);
  priceCache.set(cacheKey, {
    data: priceData,
    expiresAt: Date.now() + maxAge,
  });

  return priceData;
}

/**
 * Clear price cache
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Format price for display
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

/**
 * Format crypto amount for display
 */
export function formatCryptoAmount(
  amount: number,
  symbol: string,
  decimals: number = 6
): string {
  return `${amount.toFixed(decimals)} ${symbol}`;
}
