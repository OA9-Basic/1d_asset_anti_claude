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
 * - Morphing gradient blobs in background
 * - Pulsing glow effect on main CTA
 * - Newsletter with success feedback
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
    <section className="py-32 relative overflow-hidden">
      {/* Morphing gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/10 blur-3xl morph-blob"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-indigo-600/20 to-violet-600/10 blur-3xl morph-blob"
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <Card className="relative overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardContent className="p-12 md:p-16 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                  Ready to Unlock
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                  Premium Assets?
                </span>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
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
                  className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/30 rounded-2xl group relative overflow-hidden glow-pulse"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                  />
                </Button>
              </Link>
              <Link href="/auth/sign-in" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-base font-semibold border-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900"
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
                <Clock className="w-4 h-4" />
                <span>2 min setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
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
              className="flex-1 h-12 px-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 transition-all"
              required
            />
            <Button
              type="submit"
              size="sm"
              disabled={newsletterState !== 'idle'}
              className="h-12 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shrink-0"
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
              className="text-sm text-green-600 dark:text-green-400 mt-2 text-center"
            >
              Thanks for subscribing!
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
