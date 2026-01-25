'use client';

import { ErrorBoundary } from '@/components/error/error-boundary';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { Toaster } from '@/components/ui/toast';

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        {children}
        <Toaster />
      </LoadingProvider>
    </ErrorBoundary>
  );
}
