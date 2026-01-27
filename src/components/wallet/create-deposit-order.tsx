'use client';

import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateDepositOrderProps {
  onSuccess?: (depositOrder: any) => void;
  onError?: (error: string) => void;
}

interface CryptoCurrency {
  id: string;
  name: string;
  symbol: string;
  network: string;
  icon: string;
  decimals: number;
}

// Supported cryptocurrencies
const CURRENCIES: CryptoCurrency[] = [
  {
    id: 'USDT_POLYGON',
    name: 'Tether (USDT)',
    symbol: 'USDT',
    network: 'Polygon',
    icon: '💵',
    decimals: 6,
  },
  {
    id: 'USDC_POLYGON',
    name: 'USD Coin (USDC)',
    symbol: 'USDC',
    network: 'Polygon',
    icon: '💰',
    decimals: 6,
  },
  {
    id: 'USDT_BSC',
    name: 'Tether (USDT)',
    symbol: 'USDT',
    network: 'BSC',
    icon: '💵',
    decimals: 18,
  },
  {
    id: 'USDC_BSC',
    name: 'USD Coin (USDC)',
    symbol: 'USDC',
    network: 'BSC',
    icon: '💰',
    decimals: 18,
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum',
    icon: '⟠',
    decimals: 18,
  },
  {
    id: 'BNB',
    name: 'BNB',
    symbol: 'BNB',
    network: 'BSC',
    icon: '🔶',
    decimals: 18,
  },
  {
    id: 'MATIC',
    name: 'Polygon (MATIC)',
    symbol: 'MATIC',
    network: 'Polygon',
    icon: '🟣',
    decimals: 18,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CreateDepositOrder({ onSuccess, onError }: CreateDepositOrderProps) {
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT_POLYGON');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [quickAmounts] = useState<number[]>([10, 50, 100, 500, 1000]);

  const selectedCurrencyData = CURRENCIES.find(c => c.id === selectedCurrency);

  const handleQuickAmount = (amount: number) => {
    setUsdAmount(amount.toString());
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const amount = parseFloat(usdAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > 10000) {
        throw new Error('Maximum deposit is $10,000');
      }

      const response = await fetch('/api/wallet/deposit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usdAmount: amount,
          cryptoCurrency: selectedCurrency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create deposit order');
      }

      if (data.success) {
        onSuccess?.(data.depositOrder);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deposit order';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Deposit Funds
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose amount and cryptocurrency to deposit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount (USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              value={usdAmount}
              onChange={(e) => {
                setUsdAmount(e.target.value);
                setError('');
              }}
              min="1"
              max="10000"
              step="0.01"
              placeholder="Enter amount"
              className="block w-full pl-7 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAmount(amount)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Cryptocurrency
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.id}
                type="button"
                onClick={() => setSelectedCurrency(currency.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCurrency === currency.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.icon}</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {currency.symbol}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currency.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currency.network}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Currency Info */}
        {selectedCurrencyData && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{selectedCurrencyData.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Selected: {selectedCurrencyData.name}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Network: {selectedCurrencyData.network} •
                  Confirmations: {selectedCurrencyData.id.includes('POLYGON') ? '30' : selectedCurrencyData.id.includes('BSC') ? '10' : '12'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !usdAmount}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Order...
            </span>
          ) : (
            'Create Deposit Order'
          )}
        </button>

        {/* Info Notice */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-1">
            ⚠️ Important Information
          </p>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Price will be locked for 15 minutes after order creation</li>
            <li>• Send the exact amount shown in the next step</li>
            <li>• Only send the selected cryptocurrency on the specified network</li>
            <li>• Minimum: $1 • Maximum: $10,000 per transaction</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
