'use client';

import { AlertTriangle, Bug, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Global Error Boundary
 * Catches errors that occur in the root layout and anywhere in the app.
 * This is the last resort error handler - use error.tsx for segment-level errors.
 *
 * https://nextjs.org/docs/app/building-your-application/routing/error-handling#global-error-file
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    // Example: Sentry, LogRocket, DataDog, etc.
    if (typeof window !== 'undefined') {
      console.error('Global application error:', {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      // TODO: Send to error tracking service
      // Example with Sentry:
      // Sentry.captureException(error, {
      //   contexts: {
      //     nextjs: {
      //       digest: error.digest,
      //     },
      //   },
      // });
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[800px] w-[800px] rounded-full bg-red-500/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-orange-500/5 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          <Card className="w-full max-w-lg relative shadow-2xl border-red-500/20 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              {/* Error Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 shadow-lg shadow-red-500/10">
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>

              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Critical Error
                </CardTitle>
                <CardDescription className="text-base text-slate-400">
                  Something unexpected happened. This error has been logged and our team has been notified.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                    <Bug className="h-4 w-4" />
                    Error Details (Development)
                  </div>
                  <p className="text-sm text-slate-300 font-mono break-words">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-slate-500 font-mono">
                      Error ID: {error.digest}
                    </p>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                        Show stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-slate-600 overflow-x-auto p-2 bg-slate-950/50 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Error ID (Production) */}
              {process.env.NODE_ENV === 'production' && error.digest && (
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold">Error Reference:</span>{' '}
                    <code className="text-slate-300">{error.digest}</code>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Please provide this reference when contacting support
                  </p>
                </div>
              )}

              {/* Suggested Actions */}
              <div className="space-y-3 text-sm text-slate-400">
                <p className="font-semibold text-slate-300">Try these steps:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
                      1
                    </div>
                    <p>Refresh the page and try again</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
                      2
                    </div>
                    <p>Clear your browser cache and cookies</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
                      3
                    </div>
                    <p>Check your internet connection</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold">
                      4
                    </div>
                    <p>Contact support if the problem persists</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={reset}
                className="w-full sm:flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Application
              </Button>
              <Link href="/" className="w-full sm:flex-1">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  Go to Homepage
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Footer */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-xs text-slate-600">
              Need help? Contact{' '}
              <a href="mailto:support@example.com" className="text-slate-500 hover:text-slate-400 underline">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
