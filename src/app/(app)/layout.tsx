'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const _pathname = usePathname();

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 animate-ping opacity-20" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/20 dark:via-purple-950/20 dark:to-fuchsia-950/20">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="md:ml-64 transition-all duration-300">
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <main
          className={cn(
            'min-h-[calc(100vh-4rem)]',
            'pb-20 md:pb-0' // Add padding for mobile nav
          )}
        >
          <div className="container-custom py-6 px-4 md:px-6">{children}</div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
