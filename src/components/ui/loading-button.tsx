'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn('relative transition-all', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <Spinner size="sm" className="mr-2" />
          {loadingText || 'Loading...'}
        </span>
      )}
      <span className={cn(isLoading && 'invisible')}>
        {children}
      </span>
    </Button>
  );
}

// Preset loading button variants
export function PrimaryLoadingButton(props: LoadingButtonProps) {
  return (
    <LoadingButton
      {...props}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    />
  );
}

export function DestructiveLoadingButton(props: LoadingButtonProps) {
  return (
    <LoadingButton
      {...props}
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
    />
  );
}

export function OutlineLoadingButton(props: LoadingButtonProps) {
  return (
    <LoadingButton
      {...props}
      className={cn('border border-input bg-background hover:bg-accent hover:text-accent-foreground', props.className)}
    />
  );
}

export function GhostLoadingButton(props: LoadingButtonProps) {
  return (
    <LoadingButton
      {...props}
      className={cn('hover:bg-accent hover:text-accent-foreground', props.className)}
    />
  );
}
