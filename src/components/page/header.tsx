'use client';

import { ArrowRight, Menu, X, Home, LayoutGrid, Wallet as WalletIcon, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

/**
 * Global Header Component
 * Elegant minimalist design with clean icons
 */

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

const publicNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Browse', href: '/marketplace', icon: LayoutGrid },
];

const authenticatedNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Marketplace', href: '/marketplace', icon: LayoutGrid },
  { label: 'Assets', href: '/my-assets', icon: Home },
  { label: 'Wallet', href: '/wallet', icon: WalletIcon },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useAuth();

  // Handle scroll for glassmorphism effect (client-side only)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = user ? authenticatedNavItems : publicNavItems;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
        scrolled ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm' : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - Clean and minimalist */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
            <span className="text-white font-bold text-lg">DA</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">Digital Assets</span>
        </Link>

        {/* Desktop Navigation - Clean with icons */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center gap-2.5"
            >
              {item.icon && <item.icon className="w-4 h-4" strokeWidth={2} />}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA - Clean buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {!isLoading && user ? (
            <>
              <Link href="/wallet">
                <Button variant="ghost" size="sm" className="h-10 px-5 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <WalletIcon className="w-4 h-4 mr-2" strokeWidth={2} />
                  Wallet
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20"
                >
                  {user.firstName || user.name || user.email?.split('@')[0] || 'Account'}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button variant="ghost" size="sm" className="h-10 px-5 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Clean */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <item.icon className="w-5 h-5" strokeWidth={2} />}
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
              {!isLoading && user ? (
                <>
                  <Link href="/wallet" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full h-12 rounded-xl justify-start">
                      <WalletIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                      Wallet
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
                      {user.firstName || user.name || user.email?.split('@')[0] || 'Account'}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/sign-in" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full h-12 rounded-xl">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
