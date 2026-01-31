'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Theme Provider Component
 *
 * Wraps the application with next-themes for dark/light mode support.
 * Handles theme persistence and prevents flash of wrong theme.
 */
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
