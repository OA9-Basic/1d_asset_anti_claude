'use client';

import { motion } from 'framer-motion';

import { UnifiedCard, CardContent } from '@/components/ui/unified/unified-card';
import { staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import type { IconType } from '@/types/ui';

interface StatCardProps {
  icon: IconType;
  title: string;
  value: string | number;
  description: string;
  variant?: 'default' | 'info' | 'success' | 'primary';
  delay?: number;
}

const variantStyles = {
  default: 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300',
  info: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  success: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
  primary: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300',
};

export function StatCard({ icon: Icon, title, value, description, variant = 'default', delay }: StatCardProps) {
  return (
    <motion.div variants={staggerItem} className="group">
      <UnifiedCard variant="default" padding="lg" className="border-zinc-800/60 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                variantStyles[variant]
              )}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{title}</p>
            <motion.p
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (delay || 0) + 0.2 }}
              className="text-3xl font-bold text-zinc-100"
            >
              {value}
            </motion.p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
          </div>
        </CardContent>
      </UnifiedCard>
    </motion.div>
  );
}
