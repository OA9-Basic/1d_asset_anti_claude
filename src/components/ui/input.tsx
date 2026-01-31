import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-11 w-full rounded-lg border px-4 py-2.5 text-base',
          'bg-white dark:bg-zinc-900/50',
          'text-zinc-900 dark:text-zinc-100',
          'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
          // Border and focus states
          'border-zinc-300 dark:border-zinc-700',
          'shadow-sm',
          'transition-all duration-200',
          'focus:border-violet-500 dark:focus:border-violet-500',
          'focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-500/20',
          'focus:outline-none',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          // File input styles
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          'md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
