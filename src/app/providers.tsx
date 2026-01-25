'use client';

import { ErrorBoundary } from '@/components/error/error-boundary';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { Toaster } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        {children}
        <Toaster />
        {/* Global loading indicator for navigation */}
        <div id="global-loading" className="hidden">
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xl" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </LoadingProvider>
    </ErrorBoundary>
  );
}
