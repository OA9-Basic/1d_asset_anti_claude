/**
 * COINLORE PRICE SERVICE
 * Real-time cryptocurrency price conversion using CoinLore API
 * Free API with no rate limits or API key required
 *
 * Documentation: https://api.coinlore.net/api/ticker/?id=90 (BTC)
 *              https://api.coinlore.net/api/ticker/?id=80 (ETH)
 *              https://api.coinlore.net/api/ticker/?id=2710 (BNB)
 *              https://api.coinlore.net/api/ticker/?id=2721 (USDT)
 */

const COINLORE_API_BASE = 'https://api.coinlore.net/api';

// CoinLore IDs for supported cryptocurrencies
const COIN_IDS = {
  BTC: '90',      // Bitcoin
  ETH: '80',      // Ethereum
  BNB: '2710',    // Binance Coin
  MATIC: '2721',  // Polygon (actually USDT in CoinLore, need to verify)
  USDT: '2721',   // Tether (stablecoin)
  USDC: '3890',   // USD Coin (stablecoin)
} as const;

// Note: NETWORK_CURRENCIES reserved for future use with network-specific pricing
const _NETWORK_CURRENCIES = {
  // BSC Network
  BNB: '2710',    // Binance Coin
  USDT_BSC: '2721', // USDT on BSC
  USDC_BSC: '3890', // USDC on BSC

  // Polygon Network
  MATIC: '1',     // Polygon (need to verify ID)
  USDT_POLYGON: '2721', // USDT on Polygon
  USDC_POLYGON: '3890', // USDC on Polygon
} as const;

export interface CoinLorePriceData {
  id: string;
  symbol: string;
  name: string;
  nameid: string;
  rank: number;
  price_usd: string;
  percent_change_24h: string;
  percent_change_1h: string;
  percent_change_7d: string;
  market_cap_usd: string;
  volume24: number;
  volume24a: number;
  csupply: string;
  tsupply: string;
  msupply: string;
}

export interface CoinLoreResponse {
  data: CoinLorePriceData[];
  count: number;
}

export interface CryptoPrice {
  usd: number;
  usd_24h_change?: number;
  market_cap?: number;
  last_updated?: number;
}

export interface PriceQuote {
  cryptoAmount: number;
  usdPrice: number;
  exchangeRate: number;
  currency: string;
  network: string;
  expiresAt: Date;
  safetyMargin: number;
}

/**
 * Get current price of a cryptocurrency in USD from CoinLore
 */
export async function getCryptoPrice(currency: keyof typeof COIN_IDS): Promise<CryptoPrice> {
  const coinId = COIN_IDS[currency];

  if (!coinId) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  const url = `${COINLORE_API_BASE}/ticker/?id=${coinId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CoinLore API error: ${response.statusText}`);
  }

  const data: CoinLoreResponse = await response.json();

  if (!data.data || data.data.length === 0) {
    throw new Error(`Price data not found for ${currency}`);
  }

  const priceData = data.data[0];

  return {
    usd: parseFloat(priceData.price_usd),
    usd_24h_change: parseFloat(priceData.percent_change_24h),
    market_cap: parseFloat(priceData.market_cap_usd),
  };
}

/**
 * Get multiple crypto prices at once from CoinLore
 */
export async function getMultipleCryptoPrices(
  currencies: (keyof typeof COIN_IDS)[]
): Promise<Record<string, CryptoPrice>> {
  const coinIds = currencies
    .map(c => COIN_IDS[c])
    .filter(Boolean)
    .join(',');

  const url = `${COINLORE_API_BASE}/ticker/?id=${coinIds}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CoinLore API error: ${response.statusText}`);
  }

  const data: CoinLoreResponse = await response.json();

  const result: Record<string, CryptoPrice> = {};

  for (const priceData of data.data) {
    result[priceData.symbol] = {
      usd: parseFloat(priceData.price_usd),
      usd_24h_change: parseFloat(priceData.percent_change_24h),
      market_cap: parseFloat(priceData.market_cap_usd),
    };
  }

  return result;
}

/**
 * Convert USD to crypto amount with safety margin
 * This is the main function for deposit order creation
 *
 * @param usdAmount - Amount in USD (e.g., 10)
 * @param currency - Cryptocurrency symbol (e.g., 'BNB', 'USDT_BSC')
 * @param options - Optional configuration
 * @returns Price quote with crypto amount and expiry
 */
export async function usdToCrypto(
  usdAmount: number,
  currency: string,
  options?: {
    slippageTolerance?: number; // Default 1% (0.01) - acceptable price slippage
    safetyMargin?: number; // Default 1% (0.01) - extra amount to cover price movement
    quoteExpiryMinutes?: number; // Default 15 minutes - how long the price is locked
  }
): Promise<PriceQuote> {
  // Determine the base currency (remove network suffix)
  const baseCurrency = currency.replace(/_(BSC|POLYGON)$/, '') as keyof typeof COIN_IDS;

  const priceData = await getCryptoPrice(baseCurrency);
  const usdPrice = priceData.usd;

  // Calculate base crypto amount
  let cryptoAmount = usdAmount / usdPrice;

  // Add safety margin (default 1%)
  // This ensures the user sends enough to cover any price movement
  const safetyMargin = options?.safetyMargin ?? 0.01;
  cryptoAmount = cryptoAmount * (1 + safetyMargin);

  // Determine network
  const network = currency.includes('BSC') ? 'BSC' :
                  currency.includes('POLYGON') ? 'POLYGON' :
                  baseCurrency === 'BNB' ? 'BSC' :
                  baseCurrency === 'MATIC' ? 'POLYGON' :
                  'ETHEREUM';

  // Price quote expires in 15 minutes (default)
  const expiryMinutes = options?.quoteExpiryMinutes ?? 15;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  return {
    cryptoAmount,
    usdPrice,
    exchangeRate: usdPrice,
    currency,
    network,
    expiresAt,
    safetyMargin,
  };
}

/**
 * Convert crypto to USD amount
 * Useful for displaying received value
 */
export async function cryptoToUsd(
  cryptoAmount: number,
  currency: string
): Promise<number> {
  const baseCurrency = currency.replace(/_(BSC|POLYGON)$/, '') as keyof typeof COIN_IDS;
  const priceData = await getCryptoPrice(baseCurrency);
  return cryptoAmount * priceData.usd;
}

/**
 * Get price with caching to reduce API calls
 * Cache for 1 minute by default (crypto prices are volatile)
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
 * Clear price cache (useful if prices seem stale)
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Format USD price for display
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

/**
 * Get supported currencies for deposit
 * Returns low-fee network options
 */
export function getSupportedCurrencies(): Array<{
  symbol: string;
  name: string;
  network: string;
  chainId: number;
  recommended: boolean;
}> {
  return [
    // BSC Network - Lowest fees
    {
      symbol: 'BNB',
      name: 'BNB (Binance Smart Chain)',
      network: 'BSC',
      chainId: 56,
      recommended: true,
    },
    {
      symbol: 'USDT_BSC',
      name: 'USDT (BSC BEP20)',
      network: 'BSC',
      chainId: 56,
      recommended: true,
    },
    {
      symbol: 'USDC_BSC',
      name: 'USDC (BSC BEP20)',
      network: 'BSC',
      chainId: 56,
      recommended: true,
    },
    // Polygon Network - Low fees
    {
      symbol: 'MATIC',
      name: 'MATIC (Polygon)',
      network: 'POLYGON',
      chainId: 137,
      recommended: true,
    },
    {
      symbol: 'USDT_POLYGON',
      name: 'USDT (Polygon)',
      network: 'POLYGON',
      chainId: 137,
      recommended: true,
    },
    {
      symbol: 'USDC_POLYGON',
      name: 'USDC (Polygon)',
      network: 'POLYGON',
      chainId: 137,
      recommended: true,
    },
    // Ethereum - Higher fees (not recommended for small amounts)
    {
      symbol: 'ETH',
      name: 'ETH (Ethereum)',
      network: 'ETHEREUM',
      chainId: 1,
      recommended: false,
    },
    {
      symbol: 'USDT',
      name: 'USDT (Ethereum ERC20)',
      network: 'ETHEREUM',
      chainId: 1,
      recommended: false,
    },
    {
      symbol: 'USDC',
      name: 'USDC (Ethereum ERC20)',
      network: 'ETHEREUM',
      chainId: 1,
      recommended: false,
    },
  ];
}

/**
 * Get recommended currency for a given USD amount
 * BSC/Polygon for small amounts (<$100)
 * Ethereum for large amounts (>$100)
 */
export function getRecommendedCurrency(usdAmount: number): string {
  if (usdAmount < 100) {
    // Use BSC USDT for small amounts (lowest fees)
    return 'USDT_BSC';
  } else if (usdAmount < 500) {
    // Use BSC BNB for medium amounts
    return 'BNB';
  } else {
    // Use Ethereum for large amounts
    return 'ETH';
  }
}
