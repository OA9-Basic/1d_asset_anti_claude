'use client';

import { ArrowRight, Box, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { Parallax, ScrollReveal, TextReveal } from '@/components/animated/gsap-scroll-reveal';
import { ModelLoader } from '@/components/page/model-loader';
import { Button } from '@/components/ui/button';

/**
 * Awwwards-style Hero Section with 3D Model
 *
 * Features:
 * - Loaded 3D model (Duck from KhronosGroup samples)
 * - Smooth text reveal animations
 * - Parallax effects
 * - Mouse-following particles
 * - Clean, sophisticated design
 */

interface HeroAwwwardsProps {
  featuredCampaign?: {
    id: string;
    title: string;
    raisedAmount: number;
    goalAmount: number;
    backerCount: number;
  } | null;
}

export function HeroAwwwards({ featuredCampaign }: HeroAwwwardsProps) {
  const particlesRef = useRef<HTMLDivElement>(null);

  // Mouse-following particles effect
  useEffect(() => {
    const particlesContainer = particlesRef.current;
    if (!particlesContainer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      // Create particle
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 8px;
        height: 8px;
        background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        opacity: 0.8;
        transform: translate(-50%, -50%);
        animation: particle-fade 1s ease-out forwards;
      `;

      particlesContainer.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        particle.remove();
      }, 1000);
    };

    // Throttled mouse move handler
    let lastTime = 0;
    const throttledHandleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime > 50) { // Limit to one particle every 50ms
        lastTime = now;
        handleMouseMove(e);
      }
    };

    window.addEventListener('mousemove', throttledHandleMouseMove);

    // Add particle animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particle-fade {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.8;
        }
        100% {
          transform: translate(-50%, -150%) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('mousemove', throttledHandleMouseMove);
      style.remove();
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black">
      {/* Particles Container */}
      <div ref={particlesRef} />

      {/* 3D Model */}
      <div className="absolute inset-0 opacity-60">
        <ModelLoader
          modelPath="/models/DamagedHelmet.glb"
          scale={3}
          position={[0, -0.5, 0]}
          autoRotate={true}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 dark:via-black/30 to-white dark:to-black" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal direction="down" delay={0.2}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-8">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Community-Powered Marketplace
              </span>
            </div>
          </ScrollReveal>

          {/* Main Heading */}
          <div className="mb-8">
            <TextReveal
              text="Access Premium Digital Assets"
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-neutral-900 dark:text-white tracking-tight"
            />
          </div>

          {/* Subheading */}
          <ScrollReveal delay={0.4} direction="up">
            <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Pool resources with others to purchase premium courses, software, and digital
              products. Contribute any amount — when funded, everyone gets permanent access.
            </p>
          </ScrollReveal>

          {/* Stats - Professional Icons */}
          <ScrollReveal delay={0.5} direction="up">
            <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
              <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">10K+</p>
                  <p className="text-sm">Active Users</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
                  <Box className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">500+</p>
                  <p className="text-sm">Assets Funded</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">$1M+</p>
                  <p className="text-sm">Total Contributed</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.6} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 text-lg px-8 py-6 rounded-full"
                >
                  Browse Assets
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/request">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neutral-300 dark:border-neutral-700 text-lg px-8 py-6 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Request an Asset
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Featured Campaign Card */}
          {featuredCampaign && (
            <Parallax speed={0.3} className="mt-16">
              <ScrollReveal delay={0.8} direction="up">
                <Link
                  href={`/assets/${featuredCampaign.id}`}
                  className="block max-w-md mx-auto group"
                >
                  <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Featured Campaign
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {featuredCampaign.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        ${featuredCampaign.raisedAmount.toLocaleString()} raised
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {featuredCampaign.backerCount} backers
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            </Parallax>
          )}
        </div>
      </div>
    </section>
  );
}
