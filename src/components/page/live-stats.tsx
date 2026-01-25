'use client';

import { motion } from 'framer-motion';
import { Activity, PieChart, TrendingUp, Users } from 'lucide-react';
import CountUp from 'react-countup';

import type { StatsData } from '@/types/page';

/**
 * Live Stats Ticker Component
 * Full-width section with evenly spaced items
 * Data passed via props from server-side fetch
 */

interface LiveStatsProps {
  stats: StatsData;
}

const statItems = [
  {
    key: 'users',
    label: 'Active Users',
    icon: Users,
    color: 'violet',
    prefix: '',
  },
  {
    key: 'fundedAssets',
    label: 'Assets Funded',
    icon: TrendingUp,
    color: 'green',
    prefix: '',
  },
  {
    key: 'activeCampaigns',
    label: 'Active Campaigns',
    icon: Activity,
    color: 'orange',
    prefix: '',
  },
  {
    key: 'totalCollected',
    label: 'Total Volume',
    icon: PieChart,
    color: 'blue',
    prefix: '$',
  },
] as const;

const colorClasses = {
  violet: 'from-violet-500/10 to-indigo-500/10 text-violet-600',
  green: 'from-green-500/10 to-emerald-500/10 text-green-600',
  orange: 'from-amber-500/10 to-orange-500/10 text-orange-600',
  blue: 'from-blue-500/10 to-cyan-500/10 text-blue-600',
};

export function LiveStats({ stats }: LiveStatsProps) {
  return (
    <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {statItems.map((item, index) => {
            const value = stats[item.key as keyof StatsData] || 0;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[item.color]} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {item.prefix || ''}
                    <CountUp end={value} duration={2} separator="," decimals={item.key === 'totalCollected' ? 0 : undefined} />
                  </p>
                  <p className="text-sm text-zinc-500">{item.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
