import { type Metadata } from 'next';

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

// TODO: Replace with actual database queries
// Example: const stats = await db.$queryRaw`SELECT COUNT(*) as users FROM User`

/**
 * Fetch real-time statistics from the database
 */
async function getStats(): Promise<{
  users: number;
  fundedAssets: number;
  totalCollected: number;
  activeCampaigns: number;
}> {
  // Simulating DB call delay
  // In production: return await db.stat.findFirst()
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stats`, {
      cache: 'no-store', // Always fresh data
    });
    if (res.ok) {
      const data = await res.json();
      return {
        users: data.users || 0,
        fundedAssets: data.fundedAssets || 0,
        totalCollected: data.totalCollected || 0,
        activeCampaigns: data.activeAssets || 0,
      };
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }

  // Fallback values
  return {
    users: 0,
    fundedAssets: 0,
    totalCollected: 0,
    activeCampaigns: 0,
  };
}

/**
 * Fetch featured campaign for the hero card
 */
async function getFeaturedCampaign(): Promise<{
  id: string;
  title: string;
  raisedAmount: number;
  goalAmount: number;
  backerCount: number;
  daysLeft: number;
  avgPledge: number;
  recentContributors: Array<{ id: string; amount: number }>;
} | null> {
  // TODO: Replace with actual database query
  // Example: return await db.asset.findFirst({ where: { featured: true }, include: { contributions: true } })

  // Simulating featured campaign data
  // In production, this would come from the database
  return {
    id: 'featured-1',
    title: 'Advanced React & Next.js Masterclass',
    raisedAmount: 8450,
    goalAmount: 10000,
    backerCount: 247,
    daysLeft: 12,
    avgPledge: 34,
    recentContributors: [
      { id: '1', amount: 50 },
      { id: '2', amount: 25 },
      { id: '3', amount: 100 },
    ],
  };
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function HomePage() {
  // Fetch all data in parallel at the top level
  const [stats, featuredCampaign] = await Promise.all([
    getStats(),
    getFeaturedCampaign(),
  ]);

  return (
    <>
      {/* Single Global Header */}
      <Header />

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
