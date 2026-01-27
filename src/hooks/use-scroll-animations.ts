'use client';

import Lenis from 'lenis';
import { RefObject, useEffect, useRef, useState } from 'react';

/**
 * Awwwards-style scroll and animation hooks
 * Performance-optimized with GPU acceleration
 */

// ============================================================================
// USE IN VIEW - Optimized viewport detection
// ============================================================================

interface UseInViewOptions {
  threshold?: number;
  triggerOnce?: boolean;
  margin?: string;
  rootMargin?: string;
}

export function useInView(
  ref: RefObject<HTMLElement>,
  options: UseInViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false);
  const { threshold = 0.1, triggerOnce = false, rootMargin = '-50px' } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, threshold, triggerOnce, rootMargin]);

  return isInView;
}

// ============================================================================
// USE SCROLL PROGRESS - Track scroll position
// ============================================================================

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId: number;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));

      rafId = requestAnimationFrame(updateProgress);
    };

    rafId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return progress;
}

// Export all functions as a namespace for convenience
export const useScrollAnimations = {
  progress: useScrollProgress,
  parallax: useParallax,
};


// ============================================================================
// USE SMOOTH SCROLL - Lenis integration
// ============================================================================

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const scrollTo = (target: string | number, options?: { offset?: number; duration?: number }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  };

  return { scrollTo };
}

// ============================================================================
// USE PARALLAX - GPU-accelerated parallax effect
// ============================================================================

interface UseParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
}

export function useParallax(ref: RefObject<HTMLElement>, options: UseParallaxOptions = {}) {
  const { speed = 0.5, direction = 'up' } = options;
  const [transform, setTransform] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let rafId: number;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const relativeY = scrollY - elementTop;

      // GPU-accelerated transform
      const translateY = relativeY * speed * (direction === 'up' ? -1 : 1);

      setTransform(translateY);

      rafId = requestAnimationFrame(updateParallax);
    };

    rafId = requestAnimationFrame(updateParallax);

    return () => cancelAnimationFrame(rafId);
  }, [ref, speed, direction]);

  return transform;
}

// ============================================================================
// USE REVEAL ANIMATION - Scroll-triggered reveal
// ============================================================================

interface UseRevealAnimationOptions {
  threshold?: number;
  delay?: number;
  duration?: number;
}

export function useRevealAnimation(
  ref: RefObject<HTMLElement>,
  options: UseRevealAnimationOptions = {}
): { isVisible: boolean; hasRevealed: boolean } {
  const { threshold = 0.2, delay = 0 } = options;
  const [hasRevealed, setHasRevealed] = useState(false);
  const isVisible = useInView(ref, { threshold, triggerOnce: true });

  useEffect(() => {
    if (isVisible && !hasRevealed) {
      const timeoutId = setTimeout(() => {
        setHasRevealed(true);
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [isVisible, hasRevealed, delay]);

  return { isVisible, hasRevealed };
}

// ============================================================================
// USE STAGGER CHILDREN - Stagger animations for lists
// ============================================================================

export function useStaggerChildren(count: number, staggerDelay = 0.1) {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  const revealNext = (index: number) => {
    setVisibleIndices((prev) => new Set(prev).add(index));

    if (index < count - 1) {
      setTimeout(() => revealNext(index + 1), staggerDelay * 1000);
    }
  };

  const reset = () => setVisibleIndices(new Set());

  return { visibleIndices, revealNext, reset };
}

// ============================================================================
// GPU ACCELERATED STYLES
// ============================================================================

export const gpuAccelerated = {
  willChange: 'transform',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
};

export function getTransform(x = 0, y = 0, scale = 1, rotate = 0): string {
  return `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
}
