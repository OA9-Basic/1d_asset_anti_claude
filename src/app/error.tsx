'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
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

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <Card className="w-full max-w-md shadow-lg border-neutral-200 dark:border-neutral-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Something went wrong</CardTitle>
          <CardDescription className="text-base text-neutral-500 dark:text-neutral-400">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified and
            we&apos;re working to fix it.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error.message && (
            <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-red-600 dark:text-red-400">Error details:</span>{' '}
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Try refreshing the page
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Check your internet connection
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Contact support if the problem persists
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={reset}
            className="w-full sm:flex-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/" className="w-full sm:flex-1">
            <Button variant="outline" className="w-full border-neutral-200 dark:border-neutral-800">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
