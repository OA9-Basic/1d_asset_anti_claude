'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Zap,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Globe,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Modern Features Section
 * Awwwards-inspired grid with animated cards
 */

const features = [
  {
    id: 'discover',
    title: 'Discover Premium Assets',
    description: 'Browse thousands of courses, software, and digital products curated by our community.',
    icon: Globe,
    gradient: 'from-violet-500 to-indigo-500',
    stats: '10,000+ assets',
    span: 'md:col-span-2',
    size: 'lg',
  },
  {
    id: 'contribute',
    title: 'Contribute Any Amount',
    description: 'Every contribution counts. Start with as little as $5 and be part of something bigger.',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500',
    highlight: '$5 minimum',
    span: 'md:col-span-1',
    size: 'md',
  },
  {
    id: 'community',
    title: 'Powered by Community',
    description: 'Join thousands of creators worldwide pooling resources together.',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    stats: '10K+ members',
    span: 'md:col-span-1 md:row-span-2',
    size: 'xl',
    milestones: [
      { number: '10K+', label: 'Members' },
      { number: '500+', label: 'Assets Funded' },
      { number: '$2M+', label: 'Total Pooled' },
    ],
  },
  {
    id: 'instant',
    title: 'Instant Access',
    description: 'Get immediate access once an asset is funded. No waiting, no delays.',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    badge: '24/7 Available',
    span: 'md:col-span-1',
    size: 'md',
  },
  {
    id: 'secure',
    title: '100% Secure',
    description: 'Funds held in escrow until delivery. Full refund if goals not met.',
    icon: ShieldCheck,
    gradient: 'from-green-500 to-emerald-500',
    span: 'md:col-span-1',
    size: 'md',
  },
  {
    id: 'rewards',
    title: 'Earn Rewards',
    description: 'Excess contributions become investments. Earn returns from future sales.',
    icon: TrendingUp,
    gradient: 'from-purple-500 to-violet-500',
    cta: { text: 'Start Earning', href: '/marketplace' },
    span: 'md:col-span-2',
    size: 'lg',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function FeaturesModern() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-600/20 to-indigo-600/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/50 mb-6">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-700 dark:text-violet-400">Platform Features</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-neutral-900 dark:text-white">Why </span>
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Crowd-Fund
            </span>
            <span className="text-neutral-900 dark:text-white"> Digital Assets?</span>
          </h2>

          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Traditional pricing limits access to premium content. We break down barriers by pooling
            resources — giving everyone the power to unlock extraordinary value together.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isLarge = feature.size === 'lg' || feature.size === 'xl';

            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className={feature.span}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              >
                <Card
                  className={`group relative h-full overflow-hidden border-neutral-200/50 dark:border-neutral-800/50
                    bg-white/80 dark:bg-black/80 backdrop-blur-xl
                    hover:shadow-2xl hover:shadow-violet-500/10
                    transition-all duration-500
                    ${isLarge ? 'p-8 rounded-3xl' : 'p-6 rounded-2xl'}`}
                >
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring' as const, stiffness: 300 }}
                      className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                      style={{
                        width: isLarge ? '64px' : '52px',
                        height: isLarge ? '64px' : '52px',
                      }}
                    >
                      <Icon
                        className="text-white"
                        style={{ width: isLarge ? '32px' : '24px', height: isLarge ? '32px' : '24px' }}
                      />
                    </motion.div>

                    {/* Badge */}
                    {'badge' in feature && feature.badge && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold mb-4 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        {feature.badge}
                      </div>
                    )}

                    {'highlight' in feature && feature.highlight && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4 w-fit">
                        <Zap className="w-3 h-3" />
                        {feature.highlight}
                      </div>
                    )}

                    {'stats' in feature && feature.stats && (
                      <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-100 dark:border-violet-900/30">
                        <p className="text-2xl font-bold text-violet-600">{feature.stats}</p>
                      </div>
                    )}

                    {/* Milestones */}
                    {'milestones' in feature && feature.milestones && (
                      <div className="mb-4 space-y-3">
                        {feature.milestones.map((milestone, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                {milestone.number}
                              </p>
                              <p className="text-xs text-neutral-500">{milestone.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h3
                      className={`font-bold mb-3 text-neutral-900 dark:text-white
                        ${isLarge ? 'text-2xl' : 'text-xl'}`}
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 flex-1">
                      {feature.description}
                    </p>

                    {/* CTA */}
                    {'cta' in feature && feature.cta && (
                      <Link href={feature.cta.href}>
                        <Button
                          variant="ghost"
                          className="group/btn w-full justify-between px-4 py-6 h-auto rounded-xl border-2 border-violet-200 dark:border-violet-800/50 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                        >
                          <span className="font-semibold text-violet-700 dark:text-violet-400">
                            {feature.cta.text}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform">
                            <ArrowRight className="w-5 h-5 text-white" />
                          </div>
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <Link href="/marketplace">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-xl shadow-violet-500/30 rounded-2xl group"
            >
              Explore All Assets
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="ml-2"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
