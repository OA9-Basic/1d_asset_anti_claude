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
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  open: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
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
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
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
        {/* Logo - Premium hover animation */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
              <span className="text-white font-bold text-lg">DA</span>
            </div>
            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
          <motion.span
            className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent"
            whileHover={{ backgroundPosition: '100% 0%' }}
            transition={{ duration: 0.3 }}
          >
            Digital Assets
          </motion.span>
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

        {/* Desktop CTA - Premium styling */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {!isLoading && user ? (
            <>
              <Link href="/wallet">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  <WalletIcon className="w-4 h-4 mr-2" strokeWidth={2} />
                  Wallet
                </Button>
              </Link>
              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="sm"
                    className="h-10 px-5 text-sm font-medium rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300"
                  >
                    {user.firstName || user.name || user.email?.split('@')[0] || 'Account'}
                  </Button>
                </motion.div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-5 text-sm font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="sm"
                    className="h-10 px-5 text-sm font-medium rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                    </span>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </motion.div>
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
                      <Button variant="outline" size="sm" className="w-full h-12 rounded-xl justify-start">
                        <WalletIcon className="w-5 h-5 mr-3" strokeWidth={2} />
                        Wallet
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Button
                        size="sm"
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                      >
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
                      <Button
                        size="sm"
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
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
