import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Unified Card Variants - Premium Dark Theme
 * Consistent card styling based on Wallet page design
 */
const cardVariants = cva(
  'rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        // Default: Subtle border, no shadow
        default:
          'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700',
        // Elevated: Subtle shadow
        elevated:
          'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700',
        // Outlined: More prominent border
        outlined:
          'border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50',
        // Ghost: No border or background
        ghost: 'border-0 bg-transparent',
        // Glass: Glassmorphism effect
        glass:
          'border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md',
        // Premium: Special variant with glow
        premium:
          'border border-violet-200 dark:border-violet-900/50 bg-white dark:bg-zinc-950/50 shadow-lg shadow-violet-500/10 hover:shadow-xl hover:shadow-violet-500/20',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      animate: {
        none: '',
        fadeIn: 'fade-enter',
        scale: 'hover:scale-[1.01] active:scale-[0.99]',
        lift: 'hover-lift-premium',
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
 * - Consistent border colors (zinc-200/zinc-800)
 * - Smooth hover animations with border transitions
 * - Optional padding presets
 * - Glassmorphism variant
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
        bordered && 'pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800',
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
 * Consistent card title styling with tight tracking
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        'text-lg font-semibold text-zinc-900 dark:text-zinc-50 leading-none tracking-tight-premium',
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
      className={cn('text-sm text-zinc-500 dark:text-zinc-400', className)}
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
 * Consistent card footer area with top border
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800',
        className
      )}
      {...props}
    />
  );
});

CardFooter.displayName = 'CardFooter';
