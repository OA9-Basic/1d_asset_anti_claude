/**
 * Cryptocurrency Configuration
 */

export const CRYPTO_CURRENCIES = [
  { value: 'USDT_BSC', label: 'USDT (BSC)', network: 'BSC', icon: '💵', confirmations: 10 },
  { value: 'USDC_BSC', label: 'USDC (BSC)', network: 'BSC', icon: '💵', confirmations: 10 },
  { value: 'USDT_POLYGON', label: 'USDT (Polygon)', network: 'POLYGON', icon: '💵', confirmations: 30 },
  { value: 'USDC_POLYGON', label: 'USDC (Polygon)', network: 'POLYGON', icon: '💵', confirmations: 30 },
  { value: 'ETH', label: 'Ethereum', network: 'ETHEREUM', icon: '⟠', confirmations: 12 },
  { value: 'BNB', label: 'BNB', network: 'BSC', icon: '🟡', confirmations: 5 },
  { value: 'MATIC', label: 'MATIC', network: 'POLYGON', icon: '🟣', confirmations: 20 },
] as const;

export type CryptoCurrency = typeof CRYPTO_CURRENCIES[number]['value'];

/**
 * Crypto Networks Configuration
 */
export const CRYPTO_NETWORKS = [
  {
    value: 'ETHEREUM_MAINNET',
    label: 'Ethereum',
    shortLabel: 'ETH',
    icon: '⟠',
    chainId: 1,
    nativeCurrency: 'ETH',
  },
  {
    value: 'POLYGON_MAINNET',
    label: 'Polygon',
    shortLabel: 'MATIC',
    icon: '🟣',
    chainId: 137,
    nativeCurrency: 'MATIC',
  },
  {
    value: 'BSC_MAINNET',
    label: 'BNB Chain',
    shortLabel: 'BSC',
    icon: '🟡',
    chainId: 56,
    nativeCurrency: 'BNB',
  },
] as const;

export type CryptoNetwork = typeof CRYPTO_NETWORKS[number]['value'];

/**
 * Withdrawal Options Configuration
 */
export const WITHDRAWAL_OPTIONS = [
  { value: 'BTC', label: 'Bitcoin', icon: '₿' },
  { value: 'ETH', label: 'Ethereum', icon: '⟠' },
  { value: 'USDT', label: 'Tether', icon: '💵' },
  { value: 'USDC', label: 'USD Coin', icon: '💵' },
  { value: 'XMR', label: 'Monero', icon: '🪙' },
  { value: 'LTC', label: 'Litecoin', icon: 'Ł' },
  { value: 'BCH', label: 'Bitcoin Cash', icon: '₿' },
] as const;

export type WithdrawalOption = typeof WITHDRAWAL_OPTIONS[number]['value'];
