'use client';

import { ErrorBoundary } from '@/components/error/error-boundary';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toast';

export function ProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LoadingProvider>
          {children}
          <Toaster />
        </LoadingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
