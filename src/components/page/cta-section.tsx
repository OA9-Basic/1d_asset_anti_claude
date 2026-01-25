'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * CTA Section Component
 * Final call-to-action with trust indicators
 */

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-background" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-indigo-600/20 to-violet-600/10 blur-3xl" />

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
                Ready to Unlock Premium Assets?
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
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 text-base font-medium"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium border-2">
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
      </div>
    </section>
  );
}
