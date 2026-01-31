'use client';

import { motion } from 'framer-motion';
import {
  PieChart,
  Users,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Premium Bento Grid Features Component
 * Glass design with minimal borders for visual depth
 */

interface BentoGridFeaturesProps {
  stats?: {
    users: number;
    fundedAssets: number;
    totalCollected: number;
    activeCampaigns: number;
  };
}

// Format numbers for display
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K+`;
  }
  return num.toString();
}

const features = [
  {
    id: 'fractional',
    title: 'Fractional Ownership',
    description:
      'Every contribution matters. Pool resources with the community to unlock premium assets that would be out of reach individually.',
    icon: PieChart,
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
    span: 'md:col-span-1 md:row-span-2',
    size: 'xl',
    milestones: [
      { number: 'Growing', label: 'Active members' },
      { number: 'Growing', label: 'Assets funded' },
      { number: 'Growing', label: 'Total pooled' },
    ],
  },
  {
    id: 'protected',
    title: 'Protected Payments',
    description: 'Your funds are held in secure escrow until delivery. Full refund if the campaign doesn\'t reach its goal.',
    icon: ShieldCheck,
    span: 'md:col-span-1',
    size: 'md',
    badge: 'Secure',
  },
  {
    id: 'curated',
    title: 'Curated Quality',
    description: 'Community-driven voting ensures only high-value, premium assets make it to the platform.',
    icon: TrendingUp,
    span: 'md:col-span-1',
    size: 'md',
    rating: 'High Quality',
  },
  {
    id: 'rewards',
    title: 'Earn Rewards',
    description: 'Excess contributions transform into investments. Earn returns from future asset sales and reselling.',
    icon: TrendingUp,
    span: 'md:col-span-2',
    size: 'lg',
    cta: {
      text: 'Start earning',
      href: '/marketplace',
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

export function BentoGridFeatures({ stats }: BentoGridFeaturesProps = {}) {
  const _userCount = stats && stats.users > 0 ? formatNumber(stats.users) : 'Growing';
  const _assetCount = stats && stats.fundedAssets > 0 ? formatNumber(stats.fundedAssets) : 'Growing';
  const _volumeCount = stats && stats.totalCollected > 0 ? `$${formatNumber(stats.totalCollected)}` : 'Growing';

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-white dark:bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-100/50 via-white to-white opacity-100 dark:opacity-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-950/20 via-black to-black opacity-0 dark:opacity-100" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-zinc-900 dark:text-zinc-100">
            Why Crowd-Fund Digital Assets?
          </h2>

          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium">
            Traditional pricing limits access to premium content. We break down barriers by pooling resources —
            giving everyone the power to unlock extraordinary value together.
          </p>

          {/* Simple divider */}
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800/50" />
        </motion.div>

        {/* Premium Bento Grid with Glass Design */}
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
                <div
                  className={`group relative h-full overflow-hidden rounded-2xl
                    bg-zinc-100/50 dark:bg-zinc-900/30 backdrop-blur-sm
                    hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40
                    hover:ring-1 hover:ring-violet-500/20
                    transition-all duration-300
                    ${isLarge ? 'p-6' : 'p-5'}`}
                >
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Floating Icon */}
                    <div className={`mb-4 ${isLarge ? 'h-12' : 'h-10'}`}>
                      <Icon
                        className="text-zinc-500 dark:text-zinc-600"
                        strokeWidth={1.5}
                        style={{ width: isLarge ? '36px' : '28px', height: isLarge ? '36px' : '28px' }}
                      />
                    </div>

                    {/* Badge/Highlight */}
                    {'badge' in feature && feature.badge && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200/80 dark:bg-zinc-800/50 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-3 w-fit"
                      >
                        {feature.badge}
                      </motion.div>
                    )}

                    {'highlight' in feature && feature.highlight && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200/80 dark:bg-zinc-800/50 backdrop-blur-sm text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-3 w-fit"
                      >
                        {feature.highlight}
                      </motion.div>
                    )}

                    {'rating' in feature && feature.rating && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mb-3"
                      >
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{feature.rating}</span>
                      </motion.div>
                    )}

                    {/* Title */}
                    <h3
                      className={`font-bold mb-2 text-zinc-900 dark:text-zinc-100
                        ${isLarge ? 'text-xl' : 'text-lg'}`}
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
                        className="mb-3 p-3 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/40 backdrop-blur-sm"
                      >
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{feature.stats.value}</span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">{feature.stats.label}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">{feature.stats.insight}</p>
                      </motion.div>
                    )}

                    {/* Milestones for vertical cards */}
                    {'milestones' in feature && feature.milestones && (
                      <div className="mb-3 space-y-2">
                        {feature.milestones.map((milestone, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/40 backdrop-blur-sm"
                          >
                            <div className="w-8 h-8 rounded-full bg-zinc-300/80 dark:bg-zinc-700/50 flex items-center justify-center text-zinc-700 dark:text-zinc-400 text-xs font-bold">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{milestone.number}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">{milestone.label}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3 flex-1 font-medium">
                      {feature.description}
                    </p>

                    {/* CTA for rewards card */}
                    {'cta' in feature && feature.cta && (
                      <Link href={feature.cta.href}>
                        <button className="group/btn w-full justify-between px-4 py-3 h-auto rounded-xl bg-zinc-200/60 dark:bg-zinc-800/40 hover:bg-zinc-300/60 dark:hover:bg-zinc-700/50 backdrop-blur-sm transition-all flex items-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          <span>{feature.cta.text}</span>
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA - High contrast button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link href="/marketplace">
            <button className="h-12 px-8 text-base font-semibold bg-black text-white dark:bg-white dark:text-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center gap-2 mx-auto shadow-[0_0_20px_-5px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]">
              Explore All Assets
              <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
