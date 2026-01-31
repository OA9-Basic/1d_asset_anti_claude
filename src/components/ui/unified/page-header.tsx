import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Page Header Variants
 * Consistent page header styling across the application
 */
const pageHeaderVariants = cva(
  'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 dark:border-neutral-800',
        subtle: 'border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  asChild?: boolean;
}

/**
 * PageHeader Component
 *
 * Unified page header with consistent spacing and borders.
 * Reference design: Wallet page header style.
 */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'header';
    return (
      <Comp
        ref={ref}
        className={cn(
          'sticky top-0 z-30 w-full transition-all duration-300',
          pageHeaderVariants({ variant }),
          className
        )}
        {...props}
      />
    );
  }
);

PageHeader.displayName = 'PageHeader';

/**
 * PageHeaderContent Component
 *
 * Inner content container for page headers
 */
export const PageHeaderContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto px-6 py-6',
        className
      )}
      {...props}
    />
  );
});

PageHeaderContent.displayName = 'PageHeaderContent';

/**
 * PageTitle Component
 *
 * Consistent page title styling
 */
export const PageTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h1
      ref={ref}
      className={cn(
        'text-xl font-semibold text-neutral-900 dark:text-white tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
});

PageTitle.displayName = 'PageTitle';

/**
 * PageDescription Component
 *
 * Consistent page description styling
 */
export const PageDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        'text-sm text-neutral-500 dark:text-neutral-400 mt-0.5',
        className
      )}
      {...props}
    />
  );
});

PageDescription.displayName = 'PageDescription';
