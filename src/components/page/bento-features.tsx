'use client';

import { motion } from 'framer-motion';
import { PieChart, Users, ShieldCheck, Zap, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

import { Card } from '@/components/ui/card';

/**
 * TRUE Bento Grid Features Component
 * Asymmetrical layout with col-span-2 and row-span-2 cards
 */

const features = [
  {
    id: 'fractional',
    title: 'Fractional Ownership',
    description:
      'Contribute what you can — $1, $5, or $50. Every contribution counts toward unlocking the asset for everyone.',
    icon: PieChart,
    gradient: 'from-violet-500 to-indigo-500',
    span: 'md:col-span-2',
    isMain: true,
    isVertical: false,
  },
  {
    id: 'instant',
    title: 'Instant Access',
    description: 'Once funded, get immediate access through our secure platform.',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    span: 'md:col-span-1',
    isMain: false,
    isVertical: false,
  },
  {
    id: 'community',
    title: 'Community Power',
    description:
      'Join thousands of like-minded individuals. Together, we can access premium content that would be impossible alone.',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
    span: 'md:col-span-1 md:row-span-2',
    isMain: false,
    isVertical: true,
  },
  {
    id: 'protected',
    title: 'Protected Payments',
    description: 'Funds held in escrow until delivery. Money back if not funded.',
    icon: ShieldCheck,
    gradient: 'from-green-500 to-emerald-500',
    span: 'md:col-span-1',
    isMain: false,
    isVertical: false,
  },
  {
    id: 'curated',
    title: 'Curated Quality',
    description: 'Community voting ensures only high-quality assets make it.',
    icon: BookOpen,
    gradient: 'from-pink-500 to-rose-500',
    span: 'md:col-span-1',
    isMain: false,
    isVertical: false,
  },
  {
    id: 'rewards',
    title: 'Earn Rewards',
    description: 'Excess contributions become investments. Earn from future sales.',
    icon: TrendingUp,
    gradient: 'from-purple-500 to-violet-500',
    span: 'md:col-span-1',
    isMain: false,
    isVertical: false,
  },
] as const;

const scaleOnHover = {
  scale: 1.02,
  transition: { duration: 0.3 },
};

export function BentoGridFeatures() {
  return (
    <section className="py-32 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Why Crowd-Fund Digital Assets?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Traditional pricing limits access. We break down barriers by pooling resources.
          </p>
        </motion.div>

        {/* TRUE BENTO GRID with col-span and row-span */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={scaleOnHover}
                className={feature.span}
              >
                <Card className="h-full p-6 border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>

                  {feature.isMain && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/50 dark:to-indigo-950/50 rounded-xl border border-violet-100 dark:border-violet-900/50">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-violet-600" />
                        <span className="text-xs font-medium text-violet-600">Example Contribution</span>
                      </div>
                      <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <div className="flex justify-between">
                          <span>Your contribution:</span>
                          <span className="font-medium">$25</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Asset cost:</span>
                          <span className="font-medium">$500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>With 20 contributors:</span>
                          <span className="font-medium text-green-600">$475 left!</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {feature.isVertical && (
                    <div className="space-y-4 mb-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600">
                            {i}
                          </div>
                          <span className="flex-1">Community milestone {i}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
