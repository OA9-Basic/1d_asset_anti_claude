'use client';

import { useState } from 'react';
import { ChevronRight, Shield, Zap, Clock, CheckCircle2 } from 'lucide-react';

import { CreateDepositOrder, DepositFlow } from '@/components/wallet';

// ============================================================================
// DEPOSIT PAGE - World-Class Design
// ============================================================================

export default function DepositPage() {
  const [step, setStep] = useState<'create' | 'payment'>('create');
  const [depositOrder, setDepositOrder] = useState<any>(null);

  const handleDepositOrderCreated = (order: any) => {
    setDepositOrder(order);
    setStep('payment');
  };

  const handleDepositComplete = () => {
    window.location.href = '/wallet';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Deposit Funds
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-4">
            Add funds to your wallet using cryptocurrency. Instant processing, competitive rates.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-base transition-all duration-300 ${
                    step === 'payment'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  }`}
                >
                  {step === 'payment' ? <CheckCircle2 className="w-6 h-6" /> : '1'}
                </div>
                <p
                  className={`mt-3 text-sm font-medium tracking-wide ${
                    step === 'create' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Create Order
                </p>
              </div>

              {/* Connector */}
              <div className="w-24 h-0.5 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                {step === 'payment' && (
                  <div className="absolute inset-y-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 to-emerald-500 animate-progress-fill" />
                )}
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-base transition-all duration-300 ${
                    step === 'payment'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  2
                </div>
                <p
                  className={`mt-3 text-sm font-medium tracking-wide ${
                    step === 'payment' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  Send Payment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Secure & Encrypted</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Bank-grade security</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Instant Processing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time confirmations</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 hover:shadow-lg hover:shadow-violet-500/5 hover:border-violet-200 dark:hover:border-violet-900 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Price Locked</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">15-minute guarantee</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          {step === 'create' && (
            <div className="w-full max-w-2xl animate-fade-in">
              <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden">
                <div className="p-8 pb-6">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                    Create Deposit Order
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Choose your deposit amount and preferred cryptocurrency
                  </p>
                </div>
                <CreateDepositOrder
                  onSuccess={handleDepositOrderCreated}
                  onError={(error) => console.error('Deposit order error:', error)}
                />
              </div>
            </div>
          )}

          {step === 'payment' && depositOrder && (
            <div className="w-full max-w-3xl animate-fade-in">
              <DepositFlow
                depositOrder={depositOrder}
                onStatusChange={(status) => {
                  console.log('Deposit status changed:', status);
                }}
                onComplete={handleDepositComplete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Minimum Deposit</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Minimum deposit amount is $1.00 USD. Maximum is $10,000 per transaction.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Network Compatibility</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Only send the selected cryptocurrency on its designated network. Other networks will result in lost funds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
