/**
 * Type definitions for page components
 */

// =============================================================================
// STATS TYPES
// =============================================================================

export interface StatsData {
  users: number;
  fundedAssets: number;
  totalCollected: number;
  activeCampaigns: number;
}

export interface StatItem {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// =============================================================================
// CAMPAIGN TYPES
// =============================================================================

export interface CampaignCard {
  id: string;
  title: string;
  raisedAmount: number;
  goalAmount: number;
  backerCount: number;
  daysLeft: number;
  avgPledge: number;
  recentContributors: Contributor[];
}

export interface Contributor {
  id: string;
  amount: number;
  userId?: string;
  userName?: string;
  userImage?: string;
  createdAt?: string;
}

// =============================================================================
// FEATURE TYPES
// =============================================================================

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  span?: {
    cols?: number;
    rows?: number;
  };
}

// =============================================================================
// STEP TYPES
// =============================================================================

export interface Step {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export interface NavItem {
  label: string;
  href: string;
}

export interface AuthButton {
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
}
