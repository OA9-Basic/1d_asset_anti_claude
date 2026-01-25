import { db } from '@/lib/db'
import { AssetCard } from '@/components/features/asset-card'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, ArrowRight, Users, TrendingUp, Shield, Zap, Sparkles, CheckCircle2 } from 'lucide-react'

async function AssetGrid() {
  const assets = await db.asset.findMany({
    where: {
      status: {
        in: ['COLLECTING', 'AVAILABLE', 'PURCHASED'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })

  // Serialize Date objects to strings for Client Component
  const serializedAssets = assets.map((asset) => ({
    ...asset,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {serializedAssets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  )
}

function AssetGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-96 shimmer rounded-xl" />
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, title, value, description }: { icon: any, title: string, value: string, description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 card-hover">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-gradient mb-1">{value}</h3>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="group p-6 rounded-2xl border bg-card card-hover">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 text-primary mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function HowItWorksStep({ number, title, description }: { number: number, title: string, description: string }) {
  return (
    <div className="relative group">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl font-bold shadow-lg shadow-purple-500/30">
            {number}
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-0 group-hover:opacity-30 blur-xl transition-opacity" />
        </div>
        <h3 className="font-semibold text-lg mt-4 mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-background" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-500/10 to-violet-500/10 blur-3xl" />

        <div className="container-custom relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in">
              <Sparkles className="h-4 w-4" />
              <span>Group-Fund Digital Assets Together</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Access Premium{' '}
              <span className="text-gradient">Digital Assets</span>
              {' '}Together
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join forces with others to purchase expensive courses, software, and digital products.
              Contribute any amount — when the asset is funded, everyone gets access!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/request">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 button-glow">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Request an Asset
                </Button>
              </Link>
              <Link href="/#assets">
                <Button size="lg" variant="outline" className="w-full sm:w-auto group">
                  Browse Assets
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-muted/30">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              title="Community"
              value="10K+"
              description="Active members worldwide"
            />
            <StatCard
              icon={TrendingUp}
              title="Assets Funded"
              value="500+"
              description="Successfully funded projects"
            />
            <StatCard
              icon={Shield}
              title="Secure"
              value="100%"
              description="Safe & secure transactions"
            />
            <StatCard
              icon={Zap}
              title="Fast Access"
              value="24h"
              description="Average funding time"
            />
          </div>
        </div>
      </section>

      {/* Assets Section */}
      <section id="assets" className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse Assets</h2>
              <p className="text-muted-foreground">
                Contribute to assets currently being funded, or purchase available ones
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/create">
                <Button variant="outline">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Asset
                </Button>
              </Link>
            </div>
          </div>
          <Suspense fallback={<AssetGridSkeleton />}>
            <AssetGrid />
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t bg-muted/30">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground">
              We make it easy and affordable to access premium digital assets through community power
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Users}
              title="Community Powered"
              description="Join thousands of users pooling resources together to access premium content"
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Trusted"
              description="Your payments are protected with escrow until the asset is delivered"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Access"
              description="Get immediate access to purchased assets through our secure platform"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Earn Rewards"
              description="Excess contributions become investments that earn from future sales"
            />
            <FeatureCard
              icon={Sparkles}
              title="Curated Content"
              description="Community voting ensures only high-quality assets get funded"
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Transparent Pricing"
              description="See exactly how much is needed and where every dollar goes"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 border-t">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection lines (desktop) */}
                <div className="hidden lg:block absolute top-8 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500" />

            <HowItWorksStep
              number={1}
              title="Request Asset"
              description="Submit a request for a digital asset you want to see on the platform"
            />
            <HowItWorksStep
              number={2}
              title="Community Vote"
              description="The community votes on which assets should be added to the platform"
            />
            <HowItWorksStep
              number={3}
              title="Contribute"
              description="Contribute any amount toward funding the asset (minimum $1)"
            />
            <HowItWorksStep
              number={4}
              title="Get Access"
              description="Once funded, all contributors get permanent access to the asset"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-background">
        <div className="container-custom">
          <div className="relative max-w-3xl mx-auto text-center p-12 rounded-3xl border bg-card/50 backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join our community today and start accessing premium digital assets at a fraction of the cost
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/request">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Request Asset
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
