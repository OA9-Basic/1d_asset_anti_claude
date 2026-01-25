'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, Zap } from 'lucide-react';

import type { Step } from '@/types/page';

/**
 * How It Works Component
 * Sleek timeline style with animated SVG gradient line
 * Purely text and icon based, no heavy boxes
 */

const steps: Step[] = [
  {
    id: 'browse',
    number: 1,
    title: 'Browse Assets',
    description: 'Explore courses, software, and digital assets waiting to be funded by the community.',
    icon: BookOpen,
  },
  {
    id: 'contribute',
    number: 2,
    title: 'Contribute',
    description: 'Add any amount to help fund the asset. Every dollar brings us closer to the goal.',
    icon: Users,
  },
  {
    id: 'access',
    number: 3,
    title: 'Get Access',
    description: 'Once funded, all contributors get permanent access to the asset through our platform.',
    icon: Zap,
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Start accessing premium assets in three simple steps
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Horizontal Layout for Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 relative">
            {/* Animated SVG Gradient Line */}
            <div className="absolute top-8 left-[16%] right-[16%] h-0.5">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="rgb(99, 102, 241)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <motion.line
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                  stroke="url(#line-gradient)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative text-center"
                >
                  {/* Icon Circle */}
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/50 dark:to-indigo-950/50 border-2 border-violet-200 dark:border-violet-800 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-violet-600" />
                    </div>
                    {/* Step Number Badge */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Vertical Layout for Mobile */}
          <div className="md:hidden space-y-8 relative">
            {/* Vertical Animated Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5">
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="line-gradient-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="rgb(99, 102, 241)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <motion.line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  stroke="url(#line-gradient-vertical)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative pl-20"
                >
                  {/* Icon Circle */}
                  <div className="absolute left-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/50 dark:to-indigo-950/50 border-2 border-violet-200 dark:border-violet-800 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-violet-600" />
                  </div>

                  {/* Step Number Badge */}
                  <div className="absolute left-10 top-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
