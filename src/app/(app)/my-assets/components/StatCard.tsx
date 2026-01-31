'use client';

import { motion } from 'framer-motion';
import { DollarSign, Target, Package, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { staggerItem } from '@/lib/animations';
import type { IconType } from '@/types/ui';

interface StatCardProps {
  icon: IconType;
  title: string;
  value: string | number;
  description: string;
  delay?: number;
}

export function StatCard({ icon: Icon, title, value, description, delay }: StatCardProps) {
  return (
    <motion.div variants={staggerItem} className="group">
      <Card className="border-2 card-hover overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow"
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <motion.p
              key={value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: (delay || 0) + 0.2 }}
              className="text-3xl font-bold text-gradient"
            >
              {value}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
