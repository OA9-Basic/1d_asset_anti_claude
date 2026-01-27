'use client';

import Lenis from 'lenis';
import { ReactNode, useEffect, useRef } from 'react';

/**
 * Lenis Smooth Scroll Provider
 * Implements Awwwards-winning smooth scroll technique
 * Performance-optimized with requestAnimationFrame
 */

interface SmoothScrollProviderProps {
  children: ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
  };
}

export function SmoothScrollProvider({ children, options = {} }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      duration: options.duration || 1.2,
      easing: options.easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      touchMultiplier: options.touchMultiplier || 2,
    });

    lenisRef.current = lenis;

    // Optimize with requestAnimationFrame for 60fps
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [options]);

  return <>{children}</>;
}
