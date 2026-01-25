'use client';

import { ArrowRight, BarChart3, BookOpen, Users, Zap, ChevronRight, TrendingUp, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineLoader } from '@/components/ui/loading-overlay';

interface Stats {
  users: number;
  totalAssets: number;
  activeAssets: number;
  fundedAssets: number;
  totalContributions: number;
  activeContributors: number;
  avgFundingHours: number;
  totalCollected: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  color = 'violet',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  description: string;
  color?: 'violet' | 'blue' | 'green' | 'orange';
}) {
  const colorClasses = {
    violet: 'from-violet-500 to-purple-600 bg-violet-500/10',
    blue: 'from-blue-500 to-cyan-600 bg-blue-500/10',
    green: 'from-green-500 to-emerald-600 bg-green-500/10',
    orange: 'from-orange-500 to-amber-600 bg-orange-500/10',
  };

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl rounded-2xl" />
      <Card className="relative border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardContent className="p-6">
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-current" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 rounded-2xl border bg-card/50 backdrop-blur transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-card">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 text-primary group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 border-b bg-muted/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-2">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 border-b bg-muted/30">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Community Members"
            value={stats?.users || 0}
            description="Registered users"
            color="violet"
          />
          <StatCard
            icon={TrendingUp}
            label="Funded Assets"
            value={stats?.fundedAssets || 0}
            description="Successfully funded"
            color="green"
          />
          <StatCard
            icon={Zap}
            label="Active Campaigns"
            value={stats?.activeAssets || 0}
            description="Currently funding"
            color="orange"
          />
          <StatCard
            icon={Shield}
            label="Total Contributions"
            value={`$${formatNumber(stats?.totalCollected || 0)}`}
            description="All time funding"
            color="blue"
          />
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Minimal & Impactful */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-purple-500/10 via-violet-500/5 to-transparent blur-3xl animate-pulse delay-1000" />

        <div className="container-custom relative py-24 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap className="h-4 w-4" />
              <span>Community-Powered Digital Assets</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Access Premium{' '}
                <span className="relative inline-block">
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-600 blur-xl opacity-50" />
                  <span className="relative bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                    Digital Assets
                  </span>
                </span>
                <br />
                Together
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Pool resources with others to purchase courses, software, and digital products. Contribute any
                amount — when funded, everyone gets permanent access.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 text-base font-medium"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 text-base font-medium"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-in fade-in duration-700 delay-500">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>No platform fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-75" />
                <span>Secure escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse delay-150" />
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Stats Section */}
      <StatsSection />

      {/* Value Proposition */}
      <section className="py-24">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Why Crowd-Fund Digital Assets?
            </h2>
            <p className="text-muted-foreground text-lg">
              Traditional pricing limits access. We break down barriers by pooling resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={BarChart3}
              title="Fractional Ownership"
              description="Contribute what you can — $1, $5, or $50. Every contribution counts toward unlocking the asset for everyone."
            />
            <FeatureCard
              icon={Users}
              title="Community Power"
              description="Join thousands of like-minded individuals. Together, we can access premium content that would be impossible alone."
            />
            <FeatureCard
              icon={Shield}
              title="Protected Payments"
              description="Your funds are held in escrow until the asset is funded and delivered. If it doesn't fund, you get your money back."
            />
            <FeatureCard
              icon={Zap}
              title="Instant Access"
              description="Once an asset is funded, get immediate access through our secure platform. No waiting, no hassle."
            />
            <FeatureCard
              icon={BookOpen}
              title="Curated Quality"
              description="Community voting ensures only high-quality, in-demand assets make it to the funding stage."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Earn Rewards"
              description="Excess contributions automatically become investments. Earn from future sales of the asset."
            />
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-24 border-t bg-muted/30">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-lg">Start accessing premium assets in minutes</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {[
                {
                  icon: BookOpen,
                  title: 'Browse Assets',
                  description: 'Explore courses, software, and digital assets waiting to be funded.',
                  step: '01',
                },
                {
                  icon: Users,
                  title: 'Contribute',
                  description: 'Add any amount to help fund the asset. Every dollar brings us closer.',
                  step: '02',
                },
                {
                  icon: Zap,
                  title: 'Get Access',
                  description: 'Once funded, all contributors get permanent access to the asset.',
                  step: '03',
                },
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl font-bold shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                        {item.step}
                      </div>
                      {index < 2 && (
                        <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent -translate-y-1/2" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <item.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t">
        <div className="container-custom">
          <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-background">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-purple-500/20 to-violet-500/10 blur-3xl" />

            <CardContent className="relative p-12 md:p-16 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  Ready to Unlock Premium Assets?
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Join thousands of users already accessing premium courses, software, and digital content at a
                  fraction of the cost.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/sign-up">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 text-base font-medium"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/sign-in">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-8 text-base font-medium"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>2 min setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Secure & private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Instant access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
