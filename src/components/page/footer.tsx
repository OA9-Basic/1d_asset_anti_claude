import { Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Global Footer Component
 * Single instance - clean, professional, 4 columns
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
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Digital Assets</span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Community-powered platform for accessing premium digital assets together.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">{footerSections.product.title}</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {footerSections.product.links.map((link) => (
                <li key={link.id}>
                  {link.href === '#' ? (
                    <span className="text-zinc-400 cursor-not-allowed">{link.label}</span>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors'
                      )}
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
            <h4 className="font-semibold mb-4">{footerSections.company.title}</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {footerSections.company.links.map((link) => (
                <li key={link.id}>
                  {link.href === '#' ? (
                    <span className="text-zinc-400 cursor-not-allowed">{link.label}</span>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors'
                      )}
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
            <h4 className="font-semibold mb-4">{footerSections.legal.title}</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {footerSections.legal.links.map((link) => (
                <li key={link.id}>
                  {link.href === '#' ? (
                    <span className="text-zinc-400 cursor-not-allowed">{link.label}</span>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors'
                      )}
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} Digital Assets. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className={cn(
                  'w-64 h-10 bg-background border-zinc-200 dark:border-zinc-800',
                  'focus-visible:ring-violet-500'
                )}
              />
              <Button
                size="sm"
                className={cn(
                  'h-10 px-4 bg-gradient-to-r from-violet-600 to-indigo-600',
                  'hover:from-violet-700 hover:to-indigo-700'
                )}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
