'use client';

import { ErrorBoundary } from '@/components/error/error-boundary';
import { LoadingProvider } from '@/components/providers/loading-provider';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Spinner } from '@/components/ui/spinner';
import { Toaster } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <SmoothScrollProvider>
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
        </SmoothScrollProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
