import { Toaster } from '@/components/ui/toaster';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Full-width Marketing Layout - Header and Footer are in page components */}
      {children}

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
