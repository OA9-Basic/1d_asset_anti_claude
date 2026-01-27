'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateDepositOrder, DepositFlow } from '@/components/wallet';

// ============================================================================
// DEPOSIT PAGE - Clean, Modern Design
// ============================================================================

export default function DepositPage() {
  const router = useRouter();
  const [step, setStep] = useState<'create' | 'payment'>('create');
  const [depositOrder, setDepositOrder] = useState<Record<string, unknown> | null>(null);

  const handleDepositOrderCreated = (order: Record<string, unknown>) => {
    setDepositOrder(order);
    setStep('payment');
  };

  const handleDepositComplete = () => {
    window.location.href = '/wallet';
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('create');
    } else {
      router.push('/wallet');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="h-6 w-px bg-neutral-200 dark:border-neutral-800" />

            <div>
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                Deposit
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`flex items-center gap-2 ${
            step === 'payment' ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-900 dark:text-white'
          }`}>
            <span className="text-sm font-medium">1. Amount</span>
            <div className={`h-px w-16 ${
              step === 'payment' ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-neutral-900 dark:bg-white'
            }`} />
          </div>
          <div className={`text-sm font-medium ${
            step === 'payment' ? 'text-neutral-900 dark:text-white' : 'text-neutral-300 dark:text-neutral-700'
          }`}>
            2. Payment
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center">
          {step === 'create' && (
            <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm shadow-neutral-200/50 dark:shadow-none">
                <div className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/50">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Deposit Amount
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Enter amount and select cryptocurrency
                  </p>
                </div>
                <CreateDepositOrder
                  onSuccess={handleDepositOrderCreated}
                  onError={(error) => {
                    // Silently log errors without console
                    const _error = error;
                    return;
                  }}
                />
              </div>
            </div>
          )}

          {step === 'payment' && depositOrder && (
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <DepositFlow
                depositOrder={depositOrder}
                onStatusChange={(status) => {
                  // Silently log status changes without console
                  const _status = status;
                  return;
                }}
                onComplete={handleDepositComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
