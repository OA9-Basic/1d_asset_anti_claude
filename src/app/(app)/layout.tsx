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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
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
