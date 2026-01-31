'use client';

import Image from 'next/image';
/* eslint-disable import/no-named-as-default */
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface DepositOrder {
  id: string;
  usdAmount: number;
  cryptoAmount: number;
  cryptoCurrency: string;
  network: string;
  depositAddress: string;
  status: 'CREATED' | 'AWAITING_PAYMENT' | 'CONFIRMING' | 'COMPLETED' | 'EXPIRED' | 'FAILED';
  confirmations: number;
  requiredConfirmations: number;
  expiresAt: string;
  createdAt: string;
  txHash?: string;
}

interface DepositFlowProps {
  depositOrder: DepositOrder;
  onStatusChange?: (status: string) => void;
  onComplete?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DepositFlow({ depositOrder, onStatusChange, onComplete }: DepositFlowProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [status, setStatus] = useState<DepositOrder['status']>(depositOrder.status);
  const [confirmations, setConfirmations] = useState<number>(depositOrder.confirmations);

  // Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      try {
        // eslint-disable-next-line import/no-named-as-default-member
        const url = await QRCode.toDataURL(
          `ethereum:${depositOrder.depositAddress}`,
          {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }
        );
        setQrCodeUrl(url);
      } catch (error) {
        console.error('QR Code generation failed:', error);
      }
    };

    generateQR();
  }, [depositOrder.depositAddress]);

  // Timer countdown
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const expiresAt = new Date(depositOrder.expiresAt);
      const now = new Date();
      const remaining = Math.max(0, expiresAt.getTime() - now.getTime());
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [depositOrder.expiresAt]);

  // Poll for status updates
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/wallet/deposit-order/${depositOrder.id}/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const newStatus = data.depositOrder.status;
            setStatus(newStatus);
            setConfirmations(data.depositOrder.confirmations);

            if (onStatusChange && newStatus !== status) {
              onStatusChange(newStatus);
            }

            if (newStatus === 'COMPLETED' && onComplete) {
              onComplete();
            }
          }
        }
      } catch (error) {
        console.error('Status poll failed:', error);
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [depositOrder.id, status, onStatusChange, onComplete]);

  // Format time remaining
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const confirmationProgress = Math.min(
    100,
    (confirmations / depositOrder.requiredConfirmations) * 100
  );

  const isExpired = timeRemaining === 0;
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Deposit Funds
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Send exactly {depositOrder.cryptoAmount.toFixed(6)} {depositOrder.cryptoCurrency}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          to the address below
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <StatusBadge status={status} />
      </div>

      {/* Expired Warning */}
      {isExpired && !isCompleted && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-semibold text-center">
            ⚠️ Order Expired
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm text-center mt-1">
            Please create a new deposit order
          </p>
        </div>
      )}

      {/* Completed Success */}
      {isCompleted && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-semibold text-center">
            ✅ Deposit Completed!
          </p>
          <p className="text-green-700 dark:text-green-300 text-sm text-center mt-1">
            Funds have been credited to your wallet
          </p>
        </div>
      )}

      {/* Timer */}
      {!isExpired && !isCompleted && (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-2xl font-mono font-bold text-blue-700 dark:text-blue-300">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Price lock expires in
          </p>
        </div>
      )}

      {/* QR Code */}
      {!isCompleted && (
        <div className="mb-6 flex flex-col items-center">
          <div className="p-4 bg-white rounded-lg shadow-inner border-2 border-gray-200">
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} alt="Deposit QR Code" width={256} height={256} className="w-64 h-64" unoptimized />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100">
                <span className="text-gray-500">Loading QR Code...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deposit Address */}
      <div className="mb-6">
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Deposit Address ({depositOrder.network})
        </span>
        <div className="relative">
          <input
            type="text"
            readOnly
            value={depositOrder.depositAddress}
            aria-label={`Deposit address for ${depositOrder.network}`}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
          />
          <CopyButton text={depositOrder.depositAddress} />
        </div>
      </div>

      {/* Amount Details */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Amount (USD)</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            ${depositOrder.usdAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Amount (Crypto)</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {depositOrder.cryptoAmount.toFixed(6)} {depositOrder.cryptoCurrency}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Network</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {depositOrder.network}
          </span>
        </div>
      </div>

      {/* Confirmations Progress */}
      {status === 'CONFIRMING' && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              Confirmations
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {confirmations} / {depositOrder.requiredConfirmations}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${confirmationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Transaction Hash */}
      {depositOrder.txHash && (
        <div className="mb-6">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction Hash
          </span>
          <a
            href={`https://etherscan.io/tx/${depositOrder.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
          >
            {depositOrder.txHash}
          </a>
        </div>
      )}

      {/* Warning */}
      {!isCompleted && !isExpired && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm font-semibold mb-1">
            ⚠️ Important
          </p>
          <ul className="text-yellow-700 dark:text-yellow-300 text-xs space-y-1">
            <li>• Send ONLY {depositOrder.cryptoCurrency} on {depositOrder.network}</li>
            <li>• Send the exact amount: {depositOrder.cryptoAmount.toFixed(6)} {depositOrder.cryptoCurrency}</li>
            <li>• Order expires in {formatTime(timeRemaining)}</li>
            <li>• Minimum confirmations required: {depositOrder.requiredConfirmations}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: DepositOrder['status'] }) {
  const config = {
    CREATED: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-800 dark:text-gray-200',
      label: 'Awaiting Payment',
    },
    AWAITING_PAYMENT: {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
      label: 'Payment Detected',
    },
    CONFIRMING: {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-800 dark:text-yellow-200',
      label: 'Confirming',
    },
    COMPLETED: {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
      label: 'Completed',
    },
    EXPIRED: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      label: 'Expired',
    },
    FAILED: {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
      label: 'Failed',
    },
  }[status];

  return (
    <div className={`inline-flex px-4 py-2 rounded-full ${config.bg} text-center`}>
      <span className={`text-sm font-semibold ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  );
}
