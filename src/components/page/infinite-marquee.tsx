'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Infinite Marquee Component
 * Smooth scrolling ticker with live contributions
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
    <section className="border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
      <div className="py-4">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="flex gap-6 whitespace-nowrap"
        >
          {displayItems.map((contribution, index) => (
            <div
              key={`${contribution.id}-${index}`}
              className="flex items-center gap-3 px-6 py-2 rounded-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shrink-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                {contribution.userName}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                contributed ${contribution.amount}
              </span>
              <span className="text-sm text-neutral-400">→</span>
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
                {contribution.assetTitle}
              </span>
              <span className="text-xs text-neutral-400 ml-2">{contribution.timeAgo}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
