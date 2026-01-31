'use client';

import { SearchX, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <Card className="w-full max-w-md shadow-lg border-neutral-200 dark:border-neutral-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
            <SearchX className="h-8 w-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">Page Not Found</CardTitle>
          <CardDescription className="text-base text-neutral-500 dark:text-neutral-400">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved,
            deleted, or never existed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4">
            <p className="text-sm font-medium mb-2 text-neutral-900 dark:text-white">Here&apos;re some helpful links instead:</p>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li>
                <Link href="/marketplace" className="hover:text-neutral-900 dark:hover:text-white transition-colors underline">
                  Browse Assets
                </Link>
              </li>
              <li>
                <Link href="/request" className="hover:text-neutral-900 dark:hover:text-white transition-colors underline">
                  Request an Asset
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-neutral-900 dark:hover:text-white transition-colors underline">
                  Vote on Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-up"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors underline"
                >
                  Create an Account
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Double-check the URL for typos
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Use the navigation menu to browse
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Go back to the previous page
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="w-full sm:flex-1">
            <Button className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:flex-1 border-neutral-200 dark:border-neutral-800"
            type="button"
            onClick={() => window.history.back()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.history.back();
              }
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
