'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Premium Footer Component
 * Features:
 * - Animated underline on link hover
 * - Newsletter with success feedback
 * - Clean, professional design
 */

const footerSections = {
  product: {
    title: 'Product',
    links: [
      { label: 'Browse Assets', href: '/marketplace', id: 'browse-assets' },
      { label: 'Request Asset', href: '/request', id: 'request-asset' },
      { label: 'Create Campaign', href: '/create', id: 'create-campaign' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About', href: '#', id: 'about' },
      { label: 'Blog', href: '#', id: 'blog' },
      { label: 'Careers', href: '#', id: 'careers' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#', id: 'privacy' },
      { label: 'Terms', href: '#', id: 'terms' },
      { label: 'Security', href: '#', id: 'security' },
    ],
  },
};

export function Footer() {
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterState('loading');
    // Simulate API call
    setTimeout(() => {
      setNewsletterState('success');
    }, 1500);
  };

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20"
              >
                <span className="text-white font-bold text-sm">DA</span>
              </motion.div>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Digital Assets</span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Community-powered platform for accessing premium digital assets together.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">{footerSections.product.title}</h4>
            <ul className="space-y-2 text-sm">
              {footerSections.product.links.map((link) => (
                <li key={link.id}>
                  {link.href === '#' ? (
                    <span className="text-zinc-400 cursor-not-allowed">{link.label}</span>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors link-underline inline-block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">{footerSections.company.title}</h4>
            <ul className="space-y-2 text-sm">
              {footerSections.company.links.map((link) => (
                <li key={link.id}>
                  {link.href === '#' ? (
                    <span className="text-zinc-400 cursor-not-allowed">{link.label}</span>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors link-underline inline-block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">{footerSections.legal.title}</h4>
            <ul className="space-y-2 text-sm">
              {footerSections.legal.links.map((link) => (
                <li key={link.id}>
                  {link.href === '#' ? (
                    <span className="text-zinc-400 cursor-not-allowed">{link.label}</span>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors link-underline inline-block"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter & Copyright */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Digital Assets. All rights reserved.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                disabled={newsletterState !== 'idle'}
                className={cn(
                  'w-full md:w-64 h-10 bg-background border-zinc-200 dark:border-zinc-800',
                  'focus-visible:ring-violet-500 disabled:opacity-50'
                )}
                required
              />
              <Button
                type="submit"
                size="sm"
                disabled={newsletterState !== 'idle'}
                className={cn(
                  'h-10 px-4 bg-gradient-to-r from-violet-600 to-indigo-600',
                  'hover:from-violet-700 hover:to-indigo-700 shrink-0'
                )}
              >
                {newsletterState === 'idle' && (
                  <span className="flex items-center gap-2">
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
                {newsletterState === 'loading' && (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ⏳
                  </motion.span>
                )}
                {newsletterState === 'success' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                )}
              </Button>
            </form>
          </div>
          {newsletterState === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 dark:text-green-400 mt-2 text-center md:text-right"
            >
              Thanks for subscribing to updates!
            </motion.p>
          )}
        </div>
      </div>
    </footer>
  );
}
