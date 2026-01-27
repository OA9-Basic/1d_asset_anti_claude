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
  confirmations: number;
}

// Supported cryptocurrencies
const CURRENCIES: CryptoCurrency[] = [
  {
    id: 'USDT_BSC',
    name: 'Tether',
    symbol: 'USDT',
    network: 'BSC (BEP20)',
    confirmations: 10,
  },
  {
    id: 'USDC_BSC',
    name: 'USD Coin',
    symbol: 'USDC',
    network: 'BSC (BEP20)',
    confirmations: 10,
  },
  {
    id: 'USDT_POLYGON',
    name: 'Tether',
    symbol: 'USDT',
    network: 'Polygon',
    confirmations: 30,
  },
  {
    id: 'USDC_POLYGON',
    name: 'USD Coin',
    symbol: 'USDC',
    network: 'Polygon',
    confirmations: 30,
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum',
    confirmations: 12,
  },
  {
    id: 'BNB',
    name: 'BNB',
    symbol: 'BNB',
    network: 'BSC',
    confirmations: 10,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CreateDepositOrder({ onSuccess, onError }: CreateDepositOrderProps) {
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT_BSC');
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

      if (amount > 1000) {
        throw new Error('Maximum deposit is $1,000');
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
    <form onSubmit={handleSubmit} className="space-y-5 p-6">
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2.5">
          Amount (USD)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-neutral-400 text-sm font-medium">$</span>
          </div>
          <input
            type="number"
            value={usdAmount}
            onChange={(e) => {
              setUsdAmount(e.target.value);
              setError('');
            }}
            min="1"
            max="1000"
            step="0.01"
            placeholder="0.00"
            className="block w-full pl-8 pr-16 py-3 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-black text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent dark:focus:border-transparent transition-all sm:text-sm"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-neutral-400 text-xs font-medium tracking-wide">USD</span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleQuickAmount(amount)}
              className={`px-3.5 py-2 text-sm font-medium border rounded-lg transition-all duration-200 ${
                usdAmount === amount.toString()
                  ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
              }`}
              disabled={isLoading}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2.5">
          Cryptocurrency
        </label>
        <div className="space-y-1.5">
          {CURRENCIES.map((currency) => (
            <button
              key={currency.id}
              type="button"
              onClick={() => setSelectedCurrency(currency.id)}
              className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedCurrency === currency.id
                  ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 ring-1 ring-neutral-900 dark:ring-white'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900/30'
              }`}
              disabled={isLoading}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedCurrency === currency.id
                      ? 'bg-neutral-900 dark:bg-white'
                      : 'bg-neutral-300 dark:bg-neutral-700'
                  }`} />
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {currency.symbol}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                    {currency.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 text-xs font-medium">
                    {currency.network}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !usdAmount}
        className="w-full py-3 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-neutral-900/10 dark:shadow-white/10"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Creating...
          </span>
        ) : (
          'Continue to Payment'
        )}
      </button>

      {/* Info Notice */}
      <div className="pt-2">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center leading-relaxed">
          Price locked for 15 minutes • Min: $1 • Max: $1,000
        </p>
      </div>
    </form>
  );
}
