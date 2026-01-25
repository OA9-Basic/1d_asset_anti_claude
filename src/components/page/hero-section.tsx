'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CampaignCard } from '@/types/page';

/**
 * Hero Section Component
 * Left: Text content
 * Right: Floating campaign card with bobbing animation and background shapes
 */

interface HeroSectionProps {
  featuredCampaign: CampaignCard | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Magnetic Button Component
function MagneticButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = ref.current;
    if (!button) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = button.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.2;
    const y = (clientY - top - height / 2) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  // Extract safe props to spread
  const { disabled, type, form, onClick } = props;

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      disabled={disabled}
      type={type}
      form={form}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

export function HeroSection({ featuredCampaign }: HeroSectionProps) {
  const progress = featuredCampaign
    ? (featuredCampaign.raisedAmount / featuredCampaign.goalAmount) * 100
    : 0;

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 blur-3xl animate-pulse delay-1000" />

      {/* Floating geometric shapes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Square shapes */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] right-[15%] w-16 h-16 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-2xl rotate-45"
        />
        <motion.div
          animate={{
            y: [0, 40, 0],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[30%] right-[25%] w-12 h-12 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-2xl rotate-12"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, -180, -360],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[60%] right-[10%] w-20 h-20 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-2xl -rotate-12"
        />

        {/* Circle shapes */}
        <motion.div
          animate={{
            y: [0, 50, 0],
            x: [0, 20, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[40%] right-[8%] w-8 h-8 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full"
        />
        <motion.div
          animate={{
            y: [0, -40, 0],
            x: [0, -15, 0],
          }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[20%] right-[20%] w-10 h-10 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-full"
        />

        {/* Small dots */}
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, (i + 1) * 15, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            className="absolute top-[30%] right-[5%] w-2 h-2 bg-violet-500/30 rounded-full"
            style={{ right: `${5 + i * 3}%` }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-8">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Now in Public Beta</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Access Premium Assets,
              <br />
              <span className="relative inline-block">
                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 blur-xl opacity-50" />
                <span className="relative bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Together.
                </span>
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-xl">
              Pool resources with thousands of creators to access premium courses, software, and digital products at a
              fraction of the cost. Contribute any amount — unlock permanent access together.
            </motion.p>

            {/* CTA Buttons with Magnetic Effect */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <MagneticButton
                  className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link href="/assets" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium border-2">
                  Browse Assets
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 border-2 border-background flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-400"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium">Trusted by 10,000+ creators</p>
                <p className="text-sm text-zinc-500">Join our growing community</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Floating Campaign Card */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Floating bobbing animation */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 blur-3xl rounded-3xl" />

              {/* Campaign Card */}
              <Card className="relative bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-2xl">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Campaign Progress</p>
                    <p className="text-xs text-zinc-500">{featuredCampaign?.title || 'Loading...'}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      ${featuredCampaign?.raisedAmount.toLocaleString() || 0} raised
                    </span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1 }}
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <p className="text-lg font-bold text-violet-600">
                      {featuredCampaign?.backerCount || 0}
                    </p>
                    <p className="text-xs text-zinc-500">Backers</p>
                  </div>
                  <div className="text-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <p className="text-lg font-bold text-violet-600">
                      {featuredCampaign?.daysLeft || 0}
                    </p>
                    <p className="text-xs text-zinc-500">Days left</p>
                  </div>
                  <div className="text-center p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <p className="text-lg font-bold text-violet-600">
                      ${featuredCampaign?.avgPledge || 0}
                    </p>
                    <p className="text-xs text-zinc-500">Avg. pledge</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500">Recent Contributions</p>
                  {featuredCampaign?.recentContributors.map((contributor, i) => (
                    <motion.div
                      key={contributor.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <Users className="w-3 h-3 text-zinc-500" />
                      </div>
                      <span className="flex-1">User contributed</span>
                      <span className="font-medium">${contributor.amount}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
