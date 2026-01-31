'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronRight, Sparkles, TrendingUp, Zap, ShieldCheck, Star } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CampaignCard } from '@/types/page';

/**
 * Premium Awwwards-Winning Hero Section
 *
 * Features:
 * - Large typography with gradient text
 * - Smooth scroll-triggered animations
 * - Magnetic button effects
 * - Floating cards with parallax
 * - Live activity feed
 * - Social proof
 * - Clean, minimalist design
 */

interface HeroPremiumProps {
  featuredCampaign: CampaignCard | null;
}

// Magnetic button component
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
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
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
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

// Floating card component with parallax
function FloatingCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300, 600], [0, -30 - delay * 10, -60 - delay * 10]);

  return (
    <motion.div
      style={{ y }}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 + delay * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Live activity indicator
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

// Testimonial card
function TestimonialCard({
  name,
  jobTitle,
  content,
  avatar,
  delay,
}: {
  name: string;
  jobTitle: string;
  content: string;
  avatar: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.8 + delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <Card className="p-6 border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-black/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-black/80 transition-all duration-300">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 dark:text-white">{name}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{jobTitle}</p>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">&ldquo;{content}&rdquo;</p>
      </Card>
    </motion.div>
  );
}

// Campaign card mini
function CampaignCardMini({ campaign, delay }: { campaign: CampaignCard; delay: number }) {
  const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;

  return (
    <FloatingCard delay={delay}>
      <Link href={`/assets/${campaign.id}`}>
        <Card className="p-6 border-neutral-200/50 dark:border-neutral-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 cursor-pointer group">
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
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, delay: 1 + delay * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                +{campaign.backerCount} backers
              </span>
            </div>
            <motion.div
              className="flex items-center gap-1 text-violet-600 dark:text-violet-400 text-sm font-medium"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              View
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </Card>
      </Link>
    </FloatingCard>
  );
}

export function HeroPremium({ featuredCampaign }: HeroPremiumProps) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-black dark:to-neutral-950" />

      {/* Gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/10 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 blur-3xl"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Main content */}
      <motion.div style={{ opacity, scale }} className="relative">
        <div className="container mx-auto px-6 pt-24 pb-32">
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
                    10,000+ creators funding assets together
                  </span>
                </div>
              </motion.div>

              {/* Main heading */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
                >
                  <span className="text-neutral-900 dark:text-white">Access Premium</span>
                  <br />
                  <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                    Digital Assets
                  </span>
                  <br />
                  <span className="text-neutral-900 dark:text-white">Together</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
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

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.6 + i * 0.08,
                          type: 'spring',
                          stiffness: 200,
                        }}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 border-3 border-white dark:border-black flex items-center justify-center text-sm font-bold shadow-lg"
                      >
                        {String.fromCharCode(65 + i)}
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Trusted by 10,000+ creators
                    </p>
                    <p className="text-sm text-neutral-500">Join our growing community</p>
                  </div>
                </div>

                <div className="hidden sm:block h-12 w-px bg-neutral-200 dark:bg-neutral-800" />

                <div className="flex items-center gap-6">
                  {[
                    { icon: ShieldCheck, label: 'Secure payments' },
                    { icon: Zap, label: 'Instant access' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <item.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right column - Cards */}
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

              {/* Testimonial */}
              <TestimonialCard
                name="Sarah Chen"
                jobTitle="UX Designer"
                content="This platform completely changed how I access premium design tools. I've saved over $2,000 this year alone."
                avatar="SC"
                delay={2}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-700 flex justify-center items-start pt-2"
        >
          <div className="w-1 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
