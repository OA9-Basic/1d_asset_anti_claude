'use client';

import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, ChevronRight, Sparkles, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
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

// Enhanced Magnetic Button with scale effect
function MagneticButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = ref.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y, scale: position.x !== 0 || position.y !== 0 ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      <motion.span
        animate={{
          x: position.x * -0.3,
          y: position.y * -0.3,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
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

// Live indicator
function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
    </div>
  );
}

// Stat card
function StatCard({
  value,
  label,
  icon: Icon,
  gradient,
  delay,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 + delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
      <Card className="relative p-6 border-neutral-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{value}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      </Card>
    </motion.div>
  );
}

// Campaign card mini with enhanced hover effects
function CampaignCardMini({ campaign, delay }: { campaign: CampaignCard; delay: number }) {
  const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;

  return (
    <TiltCard tiltAmount={8}>
      <Link href={`/assets/${campaign.id}`}>
        <Card className="p-6 border-neutral-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 cursor-pointer group h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LiveIndicator />
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Featured Campaign
              </span>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
            </motion.div>
          </div>

          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
            {campaign.title}
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-neutral-900 dark:text-white">
                ${campaign.raisedAmount.toLocaleString()}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                of ${campaign.goalAmount.toLocaleString()} goal
              </span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: 1 + delay * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full relative overflow-hidden"
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 progress-shimmer" />
              </motion.div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border-2 border-white dark:border-black flex items-center justify-center text-xs text-white font-medium"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium">
                +{campaign.backerCount} backers
              </span>
            </div>
            <motion.div
              className="flex items-center gap-1 text-violet-600 dark:text-violet-400 text-sm font-medium"
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              View
              <ArrowRight className="w-4 h-4" />
            </motion.div>
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

  // Mouse parallax for background grid
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const gridX = useSpring(useTransform(mouseX, [-500, 500], [20, -20]), { stiffness: 100, damping: 30 });
  const gridY = useSpring(useTransform(mouseY, [-500, 500], [20, -20]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Text lines for stagger animation
  const textLines = [
    'Access Premium',
    'Digital Assets',
    'Together',
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-black dark:to-neutral-950" />

      {/* Mouse parallax gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/10 blur-3xl"
        style={{ x: gridX, y: gridY }}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 blur-3xl"
        style={{ x: useSpring(useTransform(mouseX, [-500, 500], [-20, 20])), y: useSpring(useTransform(mouseY, [-500, 500], [-20, 20])) }}
      />

      {/* Mouse-reactive parallax grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.03] parallax-grid"
        style={{ x: gridX, y: gridY }}
      />

      {/* Main content */}
      <motion.div style={{ opacity, scale }} className="relative">
        <div className="container mx-auto px-6 pt-32 pb-32">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left column - Hero content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex"
              >
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm">
                  <LiveIndicator />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Join thousands of creators funding assets together
                  </span>
                </div>
              </motion.div>

              {/* Main heading with stagger and animated gradient */}
              <div className="space-y-4">
                {textLines.map((line, i) => (
                  <motion.h1
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                  >
                    {i === 1 ? (
                      <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                        {line}
                      </span>
                    ) : (
                      <span className="text-neutral-900 dark:text-white">{line}</span>
                    )}
                  </motion.h1>
                ))}

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xl text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed"
                >
                  Pool resources with thousands of creators worldwide. Contribute any amount to unlock
                  premium courses, software, and digital products at a fraction of the cost.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
              >
                <Link href="/auth/sign-up" className="flex-1 sm:flex-none">
                  <MagneticButton className="h-14 px-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
                </Link>
                <Link href="/marketplace" className="flex-1 sm:flex-none">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 text-base font-semibold border-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    Browse Assets
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right column - Cards with 3D tilt */}
            <div className="lg:col-span-5 space-y-4">
              {/* Featured campaign card */}
              {featuredCampaign && <CampaignCardMini campaign={featuredCampaign} delay={0} />}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  value="$25"
                  label="Avg. contribution"
                  icon={TrendingUp}
                  gradient="from-violet-500 to-indigo-500"
                  delay={1}
                />
                <StatCard
                  value="500+"
                  label="Assets funded"
                  icon={Zap}
                  gradient="from-amber-500 to-orange-500"
                  delay={1.5}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
