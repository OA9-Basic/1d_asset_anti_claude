'use client';

import { ArrowRight, Box, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Parallax, ScrollReveal, TextReveal } from '@/components/animated/gsap-scroll-reveal';
import { ModelLoaderPro } from '@/components/page/model-loader-pro';
import { Button } from '@/components/ui/button';

/**
 * Cinematic Hero Section with Advanced 3D Effects
 *
 * Inspired by Awwwards-winning websites:
 * - Cinematic camera movements
 * - Scroll-triggered animations
 * - Dynamic lighting effects
 * - Particle systems
 * - Smooth reveal animations
 */

interface HeroCinematicProps {
  featuredCampaign?: {
    id: string;
    title: string;
    raisedAmount: number;
    goalAmount: number;
    backerCount: number;
  } | null;
}

export function HeroCinematic({ featuredCampaign }: HeroCinematicProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Mouse trail particles
  useEffect(() => {
    const createParticle = (x: number, y: number) => {
      const particle = document.createElement('div');
      particle.className = 'hero-particle';
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        transform: translate(-50%, -50%);
        animation: particle-float 1.5s ease-out forwards;
      `;
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 1500);
    };

    let lastTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime > 60) {
        createParticle(e.clientX, e.clientY);
        lastTime = now;
      }
    };

    // Add particle animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes particle-float {
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

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      style.remove();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-black"
    >
      {/* Dynamic Background Layers */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-neutral-950 dark:via-black dark:to-neutral-950" />

        {/* Animated gradient orbs with parallax */}
        <div
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse"
          style={{
            transform: `translate(${-mousePosition.x * 30}px, ${-mousePosition.y * 30}px)`,
            animationDuration: '5s',
            animationDelay: '1s',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating dust particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-violet-500/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Model with scroll-based parallax */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${scrollY * 0.5}px) scale(${1 + scrollY * 0.0002})`,
        }}
      >
        <ModelLoaderPro
          modelPath="/models/DamagedHelmet.glb"
          scale={2.2}
          position={[0, -0.2, 0]}
          autoRotate={true}
          rotateSpeed={0.15}
          enableControls={true}
          loadingColor="#8b5cf6"
        />
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient" />

      {/* Content with parallax */}
      <div
        className="relative z-10 container mx-auto px-6 py-20"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal direction="down" delay={0.2}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 mb-8 hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Community-Powered Marketplace
              </span>
            </div>
          </ScrollReveal>

          {/* Main Heading with cinematic reveal */}
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

          {/* Stats - Enhanced Cards */}
          <ScrollReveal delay={0.5} direction="up">
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
              {[
                { icon: Users, value: '10K+', label: 'Active Users' },
                { icon: Box, value: '500+', label: 'Assets Funded' },
                { icon: Zap, value: '$1M+', label: 'Total Contributed' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* CTA Buttons - Enhanced */}
          <ScrollReveal delay={0.6} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="group bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 text-lg px-8 py-6 rounded-full shadow-xl shadow-neutral-900/20 hover:shadow-2xl hover:shadow-neutral-900/30 hover:scale-105 transition-all duration-300"
                >
                  Browse Assets
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/request">
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-neutral-300 dark:border-neutral-700 text-lg px-8 py-6 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Request an Asset
                </Button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Featured Campaign Card - Glass morphism */}
          {featuredCampaign && (
            <Parallax speed={0.3} className="mt-16">
              <ScrollReveal delay={0.8} direction="up">
                <Link
                  href={`/assets/${featuredCampaign.id}`}
                  className="block max-w-md mx-auto group"
                >
                  <div className="relative p-6 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:bg-white/80 dark:hover:bg-black/80 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-violet-500/0 group-hover:from-violet-500/10 group-hover:via-purple-500/10 group-hover:to-violet-500/10 transition-all duration-500" />

                    <div className="relative flex items-center gap-2 mb-3">
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

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-neutral-400 dark:border-neutral-600 flex justify-center pt-2">
          <div className="w-1 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
