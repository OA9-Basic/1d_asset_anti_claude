/* eslint-disable react-refresh/only-export-components */
import { type Metadata } from 'next';

import { ScrollProgressBar } from '@/components/animated/reveal-on-scroll';
import { BentoGridFeatures } from '@/components/page/bento-features';
import { CTASection } from '@/components/page/cta-section';
import { Footer } from '@/components/page/footer';
import { Header } from '@/components/page/header';
import { HeroSection } from '@/components/page/hero-section';
import { HowItWorks } from '@/components/page/how-it-works';
import { LiveStats } from '@/components/page/live-stats';

export const metadata: Metadata = {
  title: 'Digital Assets - Community-Powered Asset Marketplace',
  description:
    'Pool resources with others to purchase premium courses, software, and digital products. Contribute any amount — when funded, everyone gets permanent access.',
};

// =============================================================================
// SERVER-SIDE DATA FETCHING
// =============================================================================

/**
 * Fetch real-time statistics from the database
 *
 * Uses the /api/stats endpoint which queries the database for:
 * - Total users count
 * - Funded assets count
 * - Total collected amount
 * - Active campaigns count
 */
async function getStats(): Promise<{
  users: number;
  fundedAssets: number;
  totalCollected: number;
  activeCampaigns: number;
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/stats`, {
      cache: 'no-store', // Always fresh data for homepage stats
    });

    if (res.ok) {
      const data = await res.json();
      return {
        users: data.users ?? 0,
        fundedAssets: data.fundedAssets ?? 0,
        totalCollected: data.totalCollected ?? 0,
        activeCampaigns: data.activeAssets ?? 0,
      };
    }
  } catch {
    // Silently fail - stats are non-critical for homepage
    // In production, consider logging to monitoring service
  }

  // Return empty state when API is unavailable
  // The LiveStats component will handle displaying appropriate UI
  return {
    users: 0,
    fundedAssets: 0,
    totalCollected: 0,
    activeCampaigns: 0,
  };
}

/**
 * Fetch featured campaign for the hero card
 *
 * Uses the /api/campaigns/featured endpoint which:
 * 1. Queries for assets with status 'COLLECTING'
 * 2. Sorts by progress percentage
 * 3. Returns the most promising active campaign
 */
async function getFeaturedCampaign(): Promise<{
  id: string;
  title: string;
  raisedAmount: number;
  goalAmount: number;
  backerCount: number;
  daysLeft: number;
  avgPledge: number;
  recentContributors: Array<{
    id: string;
    amount: number;
    userId?: string;
    userName?: string;
    userImage?: string;
    createdAt?: string;
  }>;
} | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/campaigns/featured`, {
      cache: 'no-store', // Always fresh data for featured campaign
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Silently fail - featured campaign is non-critical
    // In production, consider logging to monitoring service
  }

  return null;
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function HomePage() {
  // Fetch all data in parallel at the top level
  // This optimizes performance by running both fetches concurrently
  const [stats, featuredCampaign] = await Promise.all([
    getStats(),
    getFeaturedCampaign(),
  ]);

  return (
    <>
      {/* Single Global Header */}
      <Header />

      {/* Awwwards-style Scroll Progress Bar */}
      <ScrollProgressBar />

      <main className="min-h-screen">
        <HeroSection featuredCampaign={featuredCampaign} />
        <LiveStats stats={stats} />
        <BentoGridFeatures />
        <HowItWorks />
        <CTASection />
      </main>

      {/* Single Global Footer */}
      <Footer />
    </>
  );
}
