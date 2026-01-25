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
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-500/10 to-violet-500/10 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-purple-600/10">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
          <CardDescription className="text-base">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved,
            deleted, or never existed.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium mb-2">Here&apos;re some helpful links instead:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#assets" className="hover:text-primary transition-colors underline">
                  Browse Assets
                </Link>
              </li>
              <li>
                <Link href="/request" className="hover:text-primary transition-colors underline">
                  Request an Asset
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-primary transition-colors underline">
                  Vote on Requests
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-up"
                  className="hover:text-primary transition-colors underline"
                >
                  Create an Account
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
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
            <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:flex-1"
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
