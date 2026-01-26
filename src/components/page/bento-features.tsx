'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Premium Bento Grid Features Component
 * Sophisticated asymmetrical layout with refined animations
 * Awwwards-style: elegant micro-interactions and visual hierarchy
 */

const features = [
  {
    id: 'fractional',
    title: 'Fractional Ownership',
    description:
      'Every contribution matters. Pool resources with the community to unlock premium assets that would be out of reach individually.',
    icon: PieChart,
    gradient: 'from-violet-500 via-indigo-500 to-purple-500',
    span: 'md:col-span-2',
    size: 'lg',
    stats: {
      label: 'Average contribution',
      value: '$25',
      insight: 'Small amounts, big impact',
    },
  },
  {
    id: 'instant',
    title: 'Instant Access',
    description: 'Zero waiting time. Once an asset is funded, get immediate access through our secure platform.',
    icon: Zap,
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    span: 'md:col-span-1',
    size: 'md',
    highlight: '24/7 Available',
  },
  {
    id: 'community',
    title: 'Community Power',
    description:
      'Join thousands of like-minded creators worldwide. Together, we democratize access to premium digital assets.',
    icon: Users,
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    span: 'md:col-span-1 md:row-span-2',
    size: 'xl',
    milestones: [
      { number: '10K+', label: 'Active members' },
      { number: '500+', label: 'Assets funded' },
      { number: '$2M+', label: 'Total pooled' },
    ],
  },
  {
    id: 'protected',
    title: 'Protected Payments',
    description: 'Your funds are held in secure escrow until delivery. Full refund if the campaign doesn\'t reach its goal.',
    icon: ShieldCheck,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    span: 'md:col-span-1',
    size: 'md',
    badge: '100% Secure',
  },
  {
    id: 'curated',
    title: 'Curated Quality',
    description: 'Community-driven voting ensures only high-value, premium assets make it to the platform.',
    icon: Sparkles,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    span: 'md:col-span-1',
    size: 'md',
    rating: '4.9/5',
  },
  {
    id: 'rewards',
    title: 'Earn Rewards',
    description: 'Excess contributions transform into investments. Earn returns from future asset sales and reselling.',
    icon: TrendingUp,
    gradient: 'from-purple-500 via-violet-500 to-indigo-500',
    span: 'md:col-span-2',
    size: 'lg',
    cta: {
      text: 'Start earning',
      href: '/assets',
    },
  },
] as const;

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

export function BentoGridFeatures() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Premium background elements */}
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
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950/50 dark:to-indigo-950/50 border border-violet-200 dark:border-violet-800/50 mb-6"
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-700 dark:text-violet-400">Platform Features</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Why Crowd-Fund
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Digital Assets?
            </span>
          </h2>

          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Traditional pricing limits access to premium content. We break down barriers by pooling resources —
            giving everyone the power to unlock extraordinary value together.
          </p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-zinc-400"
            >
              <span className="text-xs font-medium uppercase tracking-wider">Explore features</span>
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Premium Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {features.map((feature, _index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === 'lg' || feature.size === 'xl';

            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className={feature.span}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              >
                <Card
                  className={`group relative h-full overflow-hidden border-zinc-200/50 dark:border-zinc-800/50
                    bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl
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

                    {/* Badge/Highlight */}
                    {'badge' in feature && feature.badge && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold mb-4 w-fit"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {feature.badge}
                      </motion.div>
                    )}

                    {'highlight' in feature && feature.highlight && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4 w-fit"
                      >
                        <Zap className="w-3 h-3" />
                        {feature.highlight}
                      </motion.div>
                    )}

                    {'rating' in feature && feature.rating && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-2 mb-4"
                      >
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.span
                              key={star}
                              initial={{ opacity: 0, scale: 0 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + star * 0.05 }}
                              className="text-yellow-400"
                            >
                              ★
                            </motion.span>
                          ))}
                        </div>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{feature.rating}</span>
                      </motion.div>
                    )}

                    {/* Title */}
                    <h3
                      className={`font-bold mb-3 bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent
                        ${isLarge ? 'text-2xl' : 'text-xl'}`}
                    >
                      {feature.title}
                    </h3>

                    {/* Stats for large cards */}
                    {'stats' in feature && feature.stats && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-100 dark:border-violet-900/30"
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold text-violet-600">{feature.stats.value}</span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">{feature.stats.label}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">{feature.stats.insight}</p>
                      </motion.div>
                    )}

                    {/* Milestones for vertical cards */}
                    {'milestones' in feature && feature.milestones && (
                      <div className="mb-4 space-y-3">
                        {feature.milestones.map((milestone, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-700/50"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-bold text-zinc-900 dark:text-white">{milestone.number}</p>
                              <p className="text-xs text-zinc-500">{milestone.label}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 flex-1">
                      {feature.description}
                    </p>

                    {/* CTA for rewards card */}
                    {'cta' in feature && feature.cta && (
                      <Link href={feature.cta.href}>
                        <Button
                          variant="ghost"
                          className="group/btn w-full justify-between px-4 py-6 h-auto rounded-xl border-2 border-violet-200 dark:border-violet-800/50 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                        >
                          <span className="font-semibold text-violet-700 dark:text-violet-400">
                            {feature.cta.text}
                          </span>
                          <motion.div
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover/btn:scale-110 transition-transform"
                          >
                            <ArrowRight className="w-5 h-5 text-white" />
                          </motion.div>
                        </Button>
                      </Link>
                    )}

                    {/* Hover glow effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 rounded-inherit bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 pointer-events-none"
                    />
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
          <Link href="/assets">
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
