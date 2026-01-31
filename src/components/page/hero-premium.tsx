'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronRight, type LucideIcon, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

import { Card } from '@/components/ui/card';
import type { CampaignCard } from '@/types/page';

/**
 * Premium Awwwards-Winning Hero Section
 * Features:
 * - Mouse parallax on background grid
 * - 3D tilt effect on hover for cards
 * - Enhanced magnetic button with scale
 * - Animated gradient text
 * - Smoother spring physics for parallax
 */

interface HeroPremiumProps {
  featuredCampaign: CampaignCard | null;
}

// 3D Tilt Card Component
function TiltCard({
  children,
  className,
  tiltAmount = 10,
}: {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -tiltAmount;
    const rotateYValue = ((x - centerX) / centerX) * tiltAmount;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: useSpring(rotateX, { stiffness: 300, damping: 30 }),
        rotateY: useSpring(rotateY, { stiffness: 300, damping: 30 }),
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
}

// Floating card with smoother spring parallax (available for future use)
// function FloatingCard({
//   children,
//   className,
//   delay = 0,
// }: {
//   children: React.ReactNode;
//   className?: string;
//   delay?: number;
// }) {
//   const { scrollY } = useScroll();
//   const rawY = useTransform(scrollY, [0, 300, 600], [0, -30 - delay * 10, -60 - delay * 10]);
//   const y = useSpring(rawY, { stiffness: 100, damping: 30 });
//
//   return (
//     <motion.div
//       style={{ y }}
//       className={className}
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8, delay: 0.4 + delay * 0.1, ease: [0.16, 1, 0.3, 1] }}
//     >
//       {children}
//     </motion.div>
//   );
// }

// Live indicator - Neutral styling
function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600 dark:bg-zinc-400" />
      </span>
      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Live</span>
    </div>
  );
}

// Stat card - Clean, minimal design
function StatCard({
  value,
  label,
  icon: Icon,
  gradient,
  _delay,
}: {
  value: string;
  label: string;
  icon: LucideIcon;
  gradient: string;
  _delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 + _delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="relative"
    >
      <Card className="relative p-5 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
            <Icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">{value}</p>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      </Card>
    </motion.div>
  );
}

// Campaign card mini - Clean, minimal design
function CampaignCardMini({ campaign, _delay }: { campaign: CampaignCard; _delay: number }) {
  const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;

  return (
    <TiltCard tiltAmount={4}>
      <Link href={`/assets/${campaign.id}`}>
        <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LiveIndicator />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Featured Campaign
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-zinc-400 dark:text-zinc-600" strokeWidth={1.5} />
          </div>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2">
            {campaign.title}
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                ${campaign.raisedAmount.toLocaleString()}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400">
                of ${campaign.goalAmount.toLocaleString()} goal
              </span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs text-zinc-600 dark:text-zinc-300 font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                +{campaign.backerCount} backers
              </span>
            </div>
            <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 text-sm font-medium group-hover:translate-x-0.5 transition-transform">
              View
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
        </Card>
      </Link>
    </TiltCard>
  );
}

export function HeroPremium({ featuredCampaign }: HeroPremiumProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Text lines for stagger animation
  const textLines = [
    'Access Premium',
    'Digital Assets',
    'Together',
  ];

  return (
    <section className="relative min-h-[75vh] overflow-hidden">
      {/* Clean background */}
      <div className="absolute inset-0 bg-white dark:bg-black" />

      {/* Main content */}
      <motion.div style={{ opacity, scale }} className="relative">
        <div className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left column - Hero content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex"
              >
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <LiveIndicator />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Join thousands of creators funding assets together
                  </span>
                </div>
              </motion.div>

              {/* Main heading */}
              <div className="space-y-4">
                {textLines.map((line, i) => (
                  <motion.h1
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                  >
                    <span className="text-zinc-900 dark:text-zinc-100">{line}</span>
                  </motion.h1>
                ))}

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed font-medium"
                >
                  Pool resources with thousands of creators worldwide. Contribute any amount to unlock
                  premium courses, software, and digital products at a fraction of the cost.
                </motion.p>
              </div>

              {/* CTA Buttons - Refined styling */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              >
                <Link href="/auth/sign-up" className="flex-1 sm:flex-none">
                  <button className="h-14 px-8 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </Link>
                <Link href="/marketplace" className="flex-1 sm:flex-none">
                  <button className="h-14 px-8 text-base font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center">
                    Browse Assets
                    <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                  </button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right column - Cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Featured campaign card */}
              {featuredCampaign && <CampaignCardMini campaign={featuredCampaign} _delay={0} />}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  value="$25"
                  label="Avg. contribution"
                  icon={TrendingUp}
                  gradient="from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700"
                  _delay={1}
                />
                <StatCard
                  value="500+"
                  label="Assets funded"
                  icon={Zap}
                  gradient="from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700"
                  _delay={1.5}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
