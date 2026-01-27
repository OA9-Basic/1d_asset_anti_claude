'use client';

import { useState } from 'react';

import { CreateDepositOrder, DepositFlow } from '@/components/wallet';

// ============================================================================
// DEPOSIT PAGE
// ============================================================================

export default function DepositPage() {
  const [step, setStep] = useState<'create' | 'payment'>('create');
  const [depositOrder, setDepositOrder] = useState<any>(null);

  const handleDepositOrderCreated = (order: any) => {
    setDepositOrder(order);
    setStep('payment');
  };

  const handleDepositComplete = () => {
    // Redirect to wallet or show success message
    window.location.href = '/wallet';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Deposit Crypto
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add funds to your wallet using cryptocurrency
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <StepIndicator
              number={1}
              label="Create Order"
              active={step === 'create'}
              completed={step === 'payment'}
            />
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded">
              {step === 'payment' && (
                <div className="h-full bg-blue-600 rounded transition-all duration-500" style={{ width: '100%' }} />
              )}
            </div>
            <StepIndicator
              number={2}
              label="Send Payment"
              active={step === 'payment'}
              completed={false}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center">
          {step === 'create' && (
            <CreateDepositOrder
              onSuccess={handleDepositOrderCreated}
              onError={(error) => console.error('Deposit order error:', error)}
            />
          )}

          {step === 'payment' && depositOrder && (
            <DepositFlow
              depositOrder={depositOrder}
              onStatusChange={(status) => {
                console.log('Deposit status changed:', status);
              }}
              onComplete={handleDepositComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

interface StepIndicatorProps {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}

function StepIndicator({ number, label, active, completed }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
          completed
            ? 'bg-green-600 text-white'
            : active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <p
        className={`mt-2 text-xs font-medium ${
          active || completed
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-gray-500'
        }`}
      >
        {label}
      </p>
    </div>
  );
}
