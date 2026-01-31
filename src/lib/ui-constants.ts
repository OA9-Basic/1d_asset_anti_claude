import { cva } from 'class-variance-authority';

// Badge variants - Premium dark theme
export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-violet-600 text-white shadow-sm hover:bg-violet-700 dark:bg-violet-600 dark:text-white dark:hover:bg-violet-700',
        secondary:
          'border-transparent bg-zinc-200 text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
        destructive:
          'border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-600/20 dark:text-red-400 dark:hover:bg-red-600/30',
        outline:
          'text-zinc-900 border-zinc-300 dark:text-zinc-300 dark:border-zinc-700',
        success:
          'border-transparent bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-400 dark:hover:bg-emerald-600/30',
        warning:
          'border-transparent bg-amber-600 text-white shadow-sm hover:bg-amber-700 dark:bg-amber-600/20 dark:text-amber-400 dark:hover:bg-amber-600/30',
        info:
          'border-transparent bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600/20 dark:text-blue-400 dark:hover:bg-blue-600/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Button variants - Premium dark theme with micro-interactions
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary: Gradient purple with inner glow
        default:
          'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98]',
        // Destructive: Red
        destructive:
          'bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]',
        // Outline: Transparent with border (secondary action)
        outline:
          'border border-zinc-300 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 hover:border-zinc-400 dark:border-zinc-700 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-900 dark:hover:border-zinc-600',
        // Secondary: Muted background
        secondary:
          'bg-zinc-200 text-zinc-900 shadow-sm hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
        // Ghost: No background, just hover
        ghost:
          'hover:bg-zinc-200/80 hover:text-zinc-900 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100',
        // Link: Text only
        link: 'text-violet-600 underline-offset-4 hover:underline dark:text-violet-400',
        // Premium: Special variant for CTAs
        premium:
          'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] animate-gradient-shift-premium',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3.5 text-xs',
        md: 'h-9 px-4',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
