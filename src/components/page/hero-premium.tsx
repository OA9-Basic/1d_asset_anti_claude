'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

import type { CampaignCard } from '@/types/page';

/**
 * Premium Hero Section with Depth & Life
 * Features:
 * - Centered composition with radial glow background
 * - Glass cards with minimal borders
 * - High-contrast buttons
 * - Huge typography with subtle gradients
 */

interface HeroPremiumProps {
  featuredCampaign: CampaignCard | null;
}

// Stat card - Glass design with no heavy borders
function _StatCard({
  value,
  label,
  icon: Icon,
  _delay,
}: {
  value: string;
  label: string;
  icon: LucideIcon;
  _delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 + _delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="relative p-6 rounded-2xl bg-zinc-900/50 dark:bg-white/5 backdrop-blur-sm hover:bg-zinc-800/80 dark:hover:bg-white/10 hover:ring-1 hover:ring-violet-500/30 transition-all duration-300">
        <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mb-3" strokeWidth={1.5} />
        <p className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 mb-1">{value}</p>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
      </div>
    </motion.div>
  );
}

export function HeroPremium({ featuredCampaign }: HeroPremiumProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      {/* Premium radial glow background */}
      <div className="absolute inset-0 bg-white dark:bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black opacity-0 dark:opacity-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200 via-white to-white opacity-100 dark:opacity-0" />
      </div>

      {/* Main content - Centered composition */}
      <motion.div style={{ opacity, scale }} className="relative">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex"
            >
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-100/80 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Join thousands funding assets together
                </span>
              </div>
            </motion.div>

            {/* Main heading - HUGE with gradient text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] mb-6">
                <span className="text-zinc-900 dark:text-zinc-100">Access </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                  Premium
                </span>
                <br />
                <span className="text-zinc-900 dark:text-zinc-100">Digital Assets Together</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
                Pool resources with thousands worldwide. Contribute any amount to unlock premium
                courses, software, and digital products at a fraction of the cost.
              </p>
            </motion.div>

            {/* CTA Buttons - High contrast */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4"
            >
              <Link href="/auth/sign-up" className="flex-1 sm:flex-none">
                <button className="h-14 px-8 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] dark:shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)]">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </Link>
              <Link href="/marketplace" className="flex-1 sm:flex-none">
                <button className="h-14 px-8 text-base font-semibold bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-all flex items-center justify-center">
                  Browse Assets
                  <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </button>
              </Link>
            </motion.div>

            {/* Stats - Horizontal row with dividers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="pt-8 border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="flex flex-col items-center">
                  <p className="text-3xl md:text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {featuredCampaign?.raisedAmount ? `$${(featuredCampaign.raisedAmount / 1000).toFixed(0)}K` : '25K+'}
                  </p>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-1">Total Raised</p>
                </div>
                <div className="flex flex-col items-center border-l border-r border-zinc-200 dark:border-zinc-800">
                  <p className="text-3xl md:text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-100">500+</p>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-1">Assets Funded</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-3xl md:text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-100">$25</p>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-1">Avg. Contribution</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
