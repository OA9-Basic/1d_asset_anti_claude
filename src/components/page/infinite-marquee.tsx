'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import useSWR from 'swr';

/**
 * Premium Infinite Marquee Component
 * Features:
 * - Slows down on hover
 * - Refined styling with inner shadow
 * - More padding for less cluttered feel
 * - Smooth, seamless loop
 * - REAL data from /api/activity endpoint
 */

interface Contribution {
  id: string;
  userName: string;
  amount: number;
  assetTitle: string;
  timeAgo: string;
}

interface ActivityResponse {
  activity: Array<{
    id: string;
    type: string;
    amount: number;
    user: {
      id: string;
      name: string;
    };
    asset: {
      id: string;
      title: string;
      type: string;
    };
    createdAt: string;
  }>;
}

// Helper function to format time ago
function timeAgo(dateString: string): string {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Fetch activity data
async function fetchActivity(): Promise<Contribution[]> {
  try {
    const res = await fetch('/api/activity?limit=8', {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch activity:', res.status);
      return [];
    }

    const data: ActivityResponse = await res.json();

    return data.activity.map((item) => ({
      id: item.id,
      userName: item.user.name || 'Anonymous',
      amount: Number(item.amount),
      assetTitle: item.asset.title,
      timeAgo: timeAgo(item.createdAt),
    }));
  } catch (error) {
    console.error('Error fetching activity:', error);
    return [];
  }
}

export function InfiniteMarquee() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch real activity data
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      const data = await fetchActivity();
      if (mounted) {
        setContributions(data.length > 0 ? data : []);
        setIsLoading(false);
      }
    }

    loadData();

    // Refresh every 30 seconds to show new contributions
    const interval = setInterval(loadData, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // If loading or no data, don't render the marquee
  if (isLoading || contributions.length === 0) {
    return null;
  }

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
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
