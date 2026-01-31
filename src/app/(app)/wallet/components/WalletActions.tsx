'use client';

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WalletActionsProps {
  onWithdrawClick: () => void;
}

export function WalletActions({ onWithdrawClick }: WalletActionsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <button
        onClick={() => router.push('/wallet/deposit')}
        className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 text-left hover:border-neutral-900 dark:hover:border-white transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 group-hover:scale-110 transition-transform duration-300">
              <ArrowDownCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
            Deposit Funds
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Add funds using cryptocurrency
          </p>
        </div>
      </button>

      <button
        onClick={onWithdrawClick}
        className="group relative overflow-hidden rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-6 text-left hover:border-neutral-900 dark:hover:border-white transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 group-hover:scale-110 transition-transform duration-300">
              <ArrowUpCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
            Withdraw Funds
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Request withdrawal to crypto
          </p>
        </div>
      </button>
    </div>
  );
}
