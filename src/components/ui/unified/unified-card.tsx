import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Unified Card Variants
 * Consistent card styling based on Wallet page design
 */
const cardVariants = cva(
  'rounded-xl bg-card text-card-foreground transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border border-neutral-200 dark:border-neutral-800',
        elevated: 'border-2 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md',
        outlined: 'border-2 border-neutral-200 dark:border-neutral-800',
        ghost: 'border-0 bg-transparent',
        elevatedHover:
          'border-2 border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-white shadow-sm hover:shadow-md',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      animate: {
        none: '',
        fadeIn: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
        scale: 'hover:scale-[1.02]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      animate: 'none',
    },
  }
);

export interface UnifiedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

/**
 * UnifiedCard Component
 *
 * Premium card component with consistent styling inspired by Wallet pages.
 * Features:
 * - Multiple variants for different use cases
 * - Consistent border colors and shadows
 * - Smooth hover animations
 * - Optional padding presets
 */
export const UnifiedCard = forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ className, variant, padding, animate, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding, animate }), className)}
        {...props}
      />
    );
  }
);

UnifiedCard.displayName = 'UnifiedCard';

/**
 * CardHeader Component
 *
 * Consistent card header with optional border
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { bordered?: boolean }
>(({ className, bordered = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col space-y-1.5',
        bordered && 'pb-4 border-b border-neutral-200 dark:border-neutral-800/50',
        className
      )}
      {...props}
    />
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * CardTitle Component
 *
 * Consistent card title styling
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold text-neutral-900 dark:text-white leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * CardDescription Component
 *
 * Consistent card description styling
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * CardContent Component
 *
 * Consistent card content area
 */
export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('pt-0', className)} {...props} />;
});

CardContent.displayName = 'CardContent';

/**
 * CardFooter Component
 *
 * Consistent card footer area
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800/50', className)}
      {...props}
    />
  );
});

CardFooter.displayName = 'CardFooter';
