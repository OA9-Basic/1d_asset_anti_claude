'use client';

// eslint-disable-next-line import/no-named-as-default
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP Scroll Reveal Component
 *
 * Wraps children and reveals them with smooth animations
 * when they enter the viewport during scroll.
 */

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  className?: string;
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Set initial state based on direction
    const initialState: gsap.TweenVars = {
      opacity: 0,
    };

    switch (direction) {
      case 'up':
        initialState.y = 60;
        break;
      case 'down':
        initialState.y = -60;
        break;
      case 'left':
        initialState.x = 60;
        break;
      case 'right':
        initialState.x = -60;
        break;
      case 'fade':
        // Only opacity
        break;
    }

    // Set initial state
    gsap.set(element, initialState);

    // Create scroll trigger animation
    const ctx = gsap.context(() => {
      gsap.to(element, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          end: 'top 30%',
          toggleActions: 'play none none reverse',
        },
      });
    }, element);

    return () => {
      ctx.revert();
    };
  }, [delay, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Parallax Component
 *
 * Creates a parallax effect where the element moves
 * at a different speed than the scroll.
 */

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      gsap.to(element, {
        y: -speed * 200,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, element);

    return () => {
      ctx.revert();
    };
  }, [speed]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Scale Reveal Component
 *
 * Scales an element up from 0 to full size on scroll.
 */

interface ScaleRevealProps {
  children: React.ReactNode;
  className?: string;
}

export function ScaleReveal({ children, className = '' }: ScaleRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    gsap.set(element, { scale: 0.8, opacity: 0 });

    const ctx = gsap.context(() => {
      gsap.to(element, {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      });
    }, element);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Text Split Animation Component
 *
 * Splits text into characters and animates them sequentially.
 */

interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className = '' }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Split text into characters
    const chars = text.split('');
    element.innerHTML = chars
      .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
      .join('');

    const charElements = element.querySelectorAll('span');

    gsap.set(charElements, {
      y: 50,
      opacity: 0,
    });

    const ctx = gsap.context(() => {
      gsap.to(charElements, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.03,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, element);

    return () => {
      ctx.revert();
    };
  }, [text]);

  return <div ref={containerRef} className={className} />;
}
