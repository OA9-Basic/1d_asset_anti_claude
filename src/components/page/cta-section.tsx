'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, Lock, Zap, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Premium CTA Section Component
 * Features:
 * - Inverted background for light mode (dark section)
 * - High-contrast buttons
 * - Clean design without purple gradients
 */

export function CTASection() {
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
    <section className="py-32 relative overflow-hidden bg-zinc-950 dark:bg-black">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 via-zinc-950 to-zinc-950" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <Card className="relative overflow-hidden border border-white/10 dark:border-zinc-800 bg-zinc-900/50 dark:bg-zinc-900/50 backdrop-blur-xl">
          <CardContent className="p-12 md:p-16 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white dark:text-zinc-100">
                Ready to Unlock
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 dark:from-white dark:to-zinc-400">
                  Premium Assets?
                </span>
              </h2>
              <p className="text-lg text-zinc-400 dark:text-zinc-400 max-w-2xl mx-auto">
                Join thousands of users already accessing premium courses, software, and digital content at a
                fraction of the cost.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-14 px-10 text-base font-semibold bg-white text-black dark:bg-white dark:text-black hover:bg-zinc-200 dark:hover:bg-zinc-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] rounded-xl group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                  </span>
                </Button>
              </Link>
              <Link href="/auth/sign-in" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-base font-semibold border-2 border-white/20 dark:border-zinc-700 text-white dark:text-zinc-100 rounded-xl hover:bg-white/10 dark:hover:bg-zinc-800"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <span>2 min setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" strokeWidth={1.5} />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" strokeWidth={1.5} />
                <span>Instant access</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 max-w-md mx-auto"
        >
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input
              type="email"
              placeholder="Get updates via email"
              disabled={newsletterState !== 'idle'}
              className="flex-1 h-12 px-4 rounded-xl bg-zinc-900/50 dark:bg-black border border-white/10 dark:border-zinc-800 text-white dark:text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 transition-all"
              required
            />
            <Button
              type="submit"
              size="sm"
              disabled={newsletterState !== 'idle'}
              className="h-12 px-6 bg-white text-black dark:bg-white dark:text-black hover:bg-zinc-200 dark:hover:bg-zinc-200 rounded-xl shrink-0 font-semibold"
            >
              {newsletterState === 'idle' && (
                <span>Subscribe</span>
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
          {newsletterState === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-emerald-400 mt-2 text-center"
            >
              Thanks for subscribing!
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
