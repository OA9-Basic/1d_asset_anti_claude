'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ChevronRight, Users, TrendingUp, Clock, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CampaignCard } from '@/types/page';

/**
 * Optimized Hero Section Component
 * Performance-focused with reduced LCP
 * Clean, modern design without heavy effects
 */

interface HeroSectionProps {
  featuredCampaign: CampaignCard | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Lightweight magnetic button
function MagneticButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = ref.current;
    if (!button) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = button.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = (clientX - centerX) * 0.15;
    const y = (clientY - centerY) * 0.15;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { disabled, type, form, onClick } = props;

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.5 }}
      disabled={disabled}
      type={type}
      form={form}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

// Optimized counter with fewer re-renders
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const startValue = 0;
    const endValue = value;

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Simplified easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

// Optimized campaign card - reduced animations
function OptimizedCampaignCard({ campaign }: { campaign: CampaignCard | null }) {
  const { scrollY } = useScroll();

  // Simplified parallax - only Y axis
  const y = useTransform(useSpring(scrollY, { stiffness: 100, damping: 30 }), [0, 300], [0, -50]);

  const progress = campaign ? (campaign.raisedAmount / campaign.goalAmount) * 100 : 0;

  return (
    <motion.div style={{ y }} className="relative">
      {/* Clean, subtle glow - single element */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 blur-3xl rounded-3xl" />

      <Card className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
        {/* Card Header */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Featured Campaign</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
              >
                {campaign?.title || 'Loading...'}
              </motion.p>
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-8"
          >
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  ${campaign ? <AnimatedCounter value={campaign.raisedAmount} /> : '0'}
                </p>
                <p className="text-sm text-zinc-500">of ${campaign?.goalAmount.toLocaleString() || 0} goal</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5, delay: 1 }}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full text-white font-bold text-lg shadow-lg shadow-violet-500/30"
              >
                {progress.toFixed(0)}%
              </motion.div>
            </div>

            {/* Clean progress bar */}
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { icon: Users, value: campaign?.backerCount || 0, label: 'Backers', color: 'from-violet-500 to-indigo-500' },
              { icon: Clock, value: campaign?.daysLeft || 0, label: 'Days left', color: 'from-amber-500 to-orange-500' },
              { icon: Heart, value: `$${campaign?.avgPledge || 0}`, label: 'Avg. pledge', color: 'from-pink-500 to-rose-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.9 + i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50"
              >
                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${stat.color} mb-2 shadow-lg`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {typeof stat.value === 'number' ? <AnimatedCounter value={stat.value} duration={0.8} /> : stat.value}
                </p>
                <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Live Contributions Feed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Live Contributions</p>
            </div>
            <div className="space-y-2">
              {campaign?.recentContributors.slice(0, 3).map((contributor, i) => (
                <motion.div
                  key={contributor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700/50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-md">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {contributor.userName || 'Anonymous contributor'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {contributor.createdAt ? new Date(contributor.createdAt).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full text-white text-sm font-bold shadow-md">
                    ${contributor.amount}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* View Campaign Button */}
          {campaign && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800"
            >
              <Link href={`/assets/${campaign.id}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  View Campaign
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function HeroSection({ featuredCampaign }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Clean background - minimal elements */}
      <div className="absolute inset-0">
        {/* Single gradient orb - reduced from 2 to 1 */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-violet-600/15 to-indigo-600/10 blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm mb-10">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 animate-pulse" />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Now in Public Beta</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8"
            >
              Access Premium
              <br />
              <span className="relative inline-block">
                <span className="relative bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Digital Assets,
                </span>
              </span>
              <br />
              <span className="text-zinc-900 dark:text-white">Together.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-10 max-w-xl">
              Pool resources with thousands of creators worldwide to access premium courses, software, and digital products at a
              fraction of the cost. Contribute any amount — unlock permanent access together.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <MagneticButton
                  className="h-14 px-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/30 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link href="/assets" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 text-base font-semibold border-2 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-2xl transition-all"
                >
                  Browse Assets
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.08, type: 'spring' }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border-3 border-white dark:border-zinc-900 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400 shadow-lg"
                  >
                    {String.fromCharCode(64 + i)}
                  </motion.div>
                ))}
              </div>
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                  className="text-sm font-semibold text-zinc-900 dark:text-white"
                >
                  Trusted by 10,000+ creators
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="text-sm text-zinc-500"
                >
                  Join our growing community
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Optimized Campaign Card */}
          <div className="relative hidden lg:block">
            <OptimizedCampaignCard campaign={featuredCampaign} />
          </div>
        </div>
      </div>
    </section>
  );
}
