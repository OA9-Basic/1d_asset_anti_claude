'use client';

import { ArrowRight, Box, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ScrollReveal, TextReveal } from '@/components/animated/gsap-scroll-reveal';
import { ModelLoaderPro } from '@/components/page/model-loader-pro';
import { Button } from '@/components/ui/button';

/**
 * Modern Split-Screen Hero Section
 *
 * Layout:
 * - Left Side: Content, stats, CTAs
 * - Right Side: Large 3D model display
 *
 * Design inspired by premium SaaS and product showcase websites
 */

interface HeroSplitProps {
  featuredCampaign?: {
    id: string;
    title: string;
    raisedAmount: number;
    goalAmount: number;
    backerCount: number;
  } | null;
}

export function HeroSplit({ featuredCampaign }: HeroSplitProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Subtle mouse tracking for 3D effect on content
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePosition({ x, y });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-neutral-950 dark:via-black dark:to-neutral-950" />

        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-violet-500/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-160px)]">
          {/* Left Side - Content */}
          <div
            className="space-y-8 order-2 lg:order-1"
            onMouseMove={handleMouseMove}
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            {/* Badge */}
            <ScrollReveal direction="down" delay={0.2}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 group cursor-default">
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                </div>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 tracking-wide">
                  Community-Powered Marketplace
                </span>
              </div>
            </ScrollReveal>

            {/* Main Heading */}
            <div className="space-y-4">
              <TextReveal
                text="Access Premium Digital Assets"
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-neutral-900 dark:text-white leading-[1.1] tracking-tight"
              />
              <ScrollReveal delay={0.3} direction="up">
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                  Pool resources with others to purchase premium courses, software, and digital
                  products. Contribute any amount — when funded, everyone gets permanent access.
                </p>
              </ScrollReveal>
            </div>

            {/* Stats Row */}
            <ScrollReveal delay={0.4} direction="up">
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                {[
                  { icon: Users, value: '10K+', label: 'Active Users' },
                  { icon: Box, value: '500+', label: 'Assets Funded' },
                  { icon: Zap, value: '$1M+', label: 'Contributed' },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                      <stat.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-none">
                        {stat.value}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal delay={0.5} direction="up">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/marketplace" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto group bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 text-base sm:text-lg px-8 py-6 rounded-2xl shadow-xl shadow-neutral-900/10 hover:shadow-2xl hover:shadow-neutral-900/20 hover:scale-105 transition-all duration-300"
                  >
                    Browse Assets
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/request" className="flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto group border-2 border-neutral-300 dark:border-neutral-700 text-base sm:text-lg px-8 py-6 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Request Asset
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Featured Campaign Card */}
            {featuredCampaign && (
              <ScrollReveal delay={0.6} direction="up">
                <Link
                  href={`/assets/${featuredCampaign.id}`}
                  className="block max-w-md group"
                >
                  <div className="relative p-5 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-xl border-2 border-neutral-200/50 dark:border-neutral-800/50 hover:bg-white/80 dark:hover:bg-black/80 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-violet-500/0 group-hover:from-violet-500/5 group-hover:via-purple-500/5 group-hover:to-violet-500/5 transition-all duration-500" />

                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                          Featured
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                        {featuredCampaign.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                          ${featuredCampaign.raisedAmount.toLocaleString()}
                          <span className="text-neutral-500 dark:text-neutral-500 ml-1">raised</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-white text-xs">
                          {featuredCampaign.backerCount} backers
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )}
          </div>

          {/* Right Side - 3D Model */}
          <div className="relative order-1 lg:order-2 h-[50vh] lg:h-[70vh]">
            {/* Model container with glow effect */}
            <div className="relative w-full h-full">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 rounded-3xl blur-3xl" />

              {/* 3D Model */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden">
                <ModelLoaderPro
                  modelPath="/models/DamagedHelmet.glb"
                  scale={2.8}
                  position={[0, 0, 0]}
                  autoRotate={true}
                  rotateSpeed={0.25}
                  enableControls={true}
                  loadingColor="#8b5cf6"
                  className="rounded-3xl"
                />
              </div>

              {/* Decorative border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-neutral-200/50 dark:border-neutral-800/50 pointer-events-none" />

              {/* Corner accents */}
              <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-violet-500/30 rounded-tl-2xl" />
              <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-violet-500/30 rounded-br-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 hover:opacity-60 transition-opacity">
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
          SCROLL
        </span>
        <div className="w-5 h-9 rounded-full border-2 border-neutral-400 dark:border-neutral-600 flex justify-center pt-2">
          <div className="w-1 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
