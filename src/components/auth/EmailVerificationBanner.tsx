'use client';

import { AlertCircle, Mail, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';


import { Button } from '@/components/ui/button';

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
  className?: string;
}

export function EmailVerificationBanner({ email, onDismiss, className = '' }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResendEmail = async () => {
    setIsResending(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to resend verification email.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  };

  return (
    <div className={`bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Verify your email address
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              We sent a verification link to <span className="font-medium">{maskEmail(email)}</span>.
              Please verify your email to access all features including contributions, withdrawals, and asset requests.
            </p>

            {message && (
              <div
                className={`mt-2 flex items-center gap-1.5 text-xs ${
                  message.type === 'success'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
                className="h-7 text-xs bg-white dark:bg-black border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {isResending ? (
                  <>
                    <Mail className="w-3 h-3 mr-1.5 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3 mr-1.5" />
                    Resend Email
                  </>
                )}
              </Button>
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
