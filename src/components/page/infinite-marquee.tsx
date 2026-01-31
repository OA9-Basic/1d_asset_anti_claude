'use client';

import { motion, useHover } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

/**
 * Premium Infinite Marquee Component
 * Features:
 * - Slows down on hover
 * - Refined styling with inner shadow
 * - More padding for less cluttered feel
 * - Smooth, seamless loop
 */

interface Contribution {
  id: string;
  userName: string;
  amount: number;
  assetTitle: string;
  timeAgo: string;
}

// Mock data - replace with real API
const mockContributions: Contribution[] = [
  { id: '1', userName: 'Alex M.', amount: 25, assetTitle: 'Figma Masterclass', timeAgo: '2m ago' },
  { id: '2', userName: 'Sarah K.', amount: 50, assetTitle: 'React Course Pro', timeAgo: '5m ago' },
  { id: '3', userName: 'Mike R.', amount: 15, assetTitle: 'UI Kit Bundle', timeAgo: '8m ago' },
  { id: '4', userName: 'Emma L.', amount: 100, assetTitle: '3D Assets Pack', timeAgo: '12m ago' },
  { id: '5', userName: 'John D.', amount: 30, assetTitle: 'Adobe Fonts Collection', timeAgo: '15m ago' },
  { id: '6', userName: 'Lisa P.', amount: 45, assetTitle: 'Video Editing Course', timeAgo: '18m ago' },
  { id: '7', userName: 'David W.', amount: 20, assetTitle: 'Icon Library', timeAgo: '22m ago' },
  { id: '8', userName: 'Anna S.', amount: 75, assetTitle: 'Photography Presets', timeAgo: '25m ago' },
];

export function InfiniteMarquee() {
  const [contributions, setContributions] = useState<Contribution[]>([...mockContributions]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHovered = useHover(containerRef);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setContributions((prev) => {
        const newContribution: Contribution = {
          id: Date.now().toString(),
          userName: ['Chris B.', 'Nina T.', 'Tom H.', 'Lucy G.', 'Jack M.'][Math.floor(Math.random() * 5)],
          amount: [15, 25, 50, 75, 100][Math.floor(Math.random() * 5)],
          assetTitle: mockContributions[Math.floor(Math.random() * mockContributions.length)].assetTitle,
          timeAgo: 'Just now',
        };
        return [newContribution, ...prev.slice(0, -1)];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Duplicate items for seamless loop
  const displayItems = [...contributions, ...contributions];

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Live Activity
          </p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Join the movement
          </h3>
        </motion.div>

        {/* Marquee Container */}
        <motion.div
          ref={containerRef}
          className="relative"
        >
          {/* Fade effect on left */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 to-transparent z-10 pointer-events-none" />

          {/* Fade effect on right */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 to-transparent z-10 pointer-events-none" />

          {/* Scrolling content */}
          <motion.div
            animate={{ x: [0, -2000] }}
            transition={{
              duration: isHovered ? 120 : 40, // Slow down on hover
              repeat: Infinity,
              ease: 'linear',
            }}
            className="flex gap-4 whitespace-nowrap py-4"
          >
            {displayItems.map((contribution, index) => (
              <motion.div
                key={`${contribution.id}-${index}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white dark:bg-black border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow shrink-0"
                whileHover={{ scale: 1.02 }}
                style={{
                  boxShadow: 'inset 0 1px 0 0 rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50" />
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {contribution.userName}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  contributed ${contribution.amount}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">→</span>
                <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                  {contribution.assetTitle}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1">{contribution.timeAgo}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Subtle text below */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-sm text-zinc-400 dark:text-zinc-600 mt-6"
        >
          Real contributions from our community
        </motion.p>
      </div>
    </section>
  );
}
