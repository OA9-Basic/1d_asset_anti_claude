'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X, Home, LayoutGrid, Wallet as WalletIcon, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

/**
 * Premium Awwwards-Winning Header
 * Features:
 * - Smooth glassmorphism with refined transitions
 * - Logo hover animation with lift and shimmer
 * - Nav items with subtle shift on hover
 * - Mobile menu with slide-in stagger animation
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

const mobileMenuVariants = {
  closed: {
    y: '-100%',
    opacity: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  open: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const mobileItemVariants = {
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

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
        scrolled
          ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/30 dark:border-zinc-800/30 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - Clean, minimal styling */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
            Digital Assets
          </span>
        </Link>

        {/* Desktop Navigation - Enhanced with subtle hover shift */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                href={item.href}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center gap-2.5"
              >
                {item.icon && <item.icon className="w-4 h-4" strokeWidth={2} />}
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop CTA - Refined white/black theme */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {!isLoading && user ? (
            <>
              <Link href="/wallet">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  <WalletIcon className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Wallet
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 transition-all duration-200"
                >
                  {user.firstName || user.name || user.email?.split('@')[0] || 'Account'}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-lg border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all duration-200 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Premium animation */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5" strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      {/* Mobile Menu - Premium slide-in with stagger */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-800/50"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-2">
              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  variants={mobileItemVariants}
                  onClick={() => setIsOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-3"
                  >
                    {item.icon && <item.icon className="w-5 h-5" strokeWidth={2} />}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={mobileItemVariants} className="flex flex-col gap-2 pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                {!isLoading && user ? (
                  <>
                    <Link href="/wallet" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full h-12 rounded-lg justify-start border-zinc-300 dark:border-zinc-700">
                        <WalletIcon className="w-5 h-5 mr-3" strokeWidth={1.5} />
                        Wallet
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full h-12 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        {user.firstName || user.name || user.email?.split('@')[0] || 'Account'}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/sign-in" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full h-12 rounded-lg border-zinc-300 dark:border-zinc-700">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full h-12 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
