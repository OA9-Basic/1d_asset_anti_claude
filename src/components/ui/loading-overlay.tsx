'use client';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'blur';
}

export function LoadingOverlay({
  isLoading,
  children,
  message,
  className,
  spinnerSize = 'lg',
  variant = 'blur',
}: LoadingOverlayProps) {
  const overlayClasses = {
    light: 'bg-white/80 dark:bg-gray-900/80',
    dark: 'bg-black/80',
    blur: 'bg-background/60 backdrop-blur-sm',
  };

  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 z-50 flex flex-col items-center justify-center',
            overlayClasses[variant]
          )}
        >
          <Spinner size={spinnerSize} className="text-primary mb-4" />
          {message && (
            <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Full page loader
export function FullPageLoader({
  message = 'Loading...',
  spinnerSize = 'xl',
}: {
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <Spinner size={spinnerSize} className="text-primary mb-4" />
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

// Inline loader for smaller sections
export function InlineLoader({
  message,
  size = 'sm',
}: {
  message?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner size={size} />
      {message && <span>{message}</span>}
    </div>
  );
}
