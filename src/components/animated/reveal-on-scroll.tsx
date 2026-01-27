'use client';

import { motion, useInView } from 'framer-motion';
import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useRef } from 'react';

import { useScrollProgress, useParallax } from '@/hooks/use-scroll-animations';

/**
 * Awwwards-style scroll-triggered reveal animations
 * GPU-accelerated with smooth easing
 */

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

interface RevealOnScrollProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  threshold?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

const revealVariants = {
  up: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -60 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function RevealOnScroll({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = '',
  once = true,
  staggerChildren = false,
  staggerDelay = 0.1,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: threshold, once });

  const customVariants = {
    ...revealVariants[direction],
    visible: {
      ...revealVariants[direction].visible,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1] as any, // Awwwards-style easing
      },
    },
  };

  const containerVariants = staggerChildren
    ? {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }
    : undefined;

  const childArray = Children.toArray(children);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
      style={{
        // GPU acceleration
        willChange: isInView ? 'auto' : 'transform, opacity',
      }}
    >
      {staggerChildren
        ? childArray.map((child, i) =>
            isValidElement(child) ? (
              <motion.div
                key={i}
                variants={customVariants}
                style={{ display: 'inline-block' }}
              >
                {child}
              </motion.div>
            ) : null
          )
        : cloneElement(children as ReactElement, {
            initial: 'hidden',
            animate: isInView ? 'visible' : 'hidden',
            variants: customVariants,
          })}
    </motion.div>
  );
}

// ============================================================================
// STAGGER REVEAL - For lists and grids
// ============================================================================

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  threshold?: number;
  direction?: RevealDirection;
}

export function StaggerReveal({
  children,
  className = '',
  staggerDelay = 0.1,
  threshold = 0.1,
  direction = 'up',
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: threshold, once: true });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants = revealVariants[direction];

  const childArray = Children.toArray(children);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {childArray.map((child, i) =>
        isValidElement(child) ? (
          <motion.div
            key={i}
            variants={itemVariants}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1] as any,
            }}
            style={{ display: 'inline-block' }}
          >
            {child}
          </motion.div>
        ) : null
      )}
    </motion.div>
  );
}

// ============================================================================
// PARALLAX SCROLL - GPU-accelerated parallax
// ============================================================================

interface ParallaxScrollProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxScroll({ children, speed = 0.5, className = '' }: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const transform = useParallax(ref, { speed });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, ${transform}px, 0)`,
        willChange: 'transform',
        backfaceVisibility: 'hidden' as const,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SCROLL PROGRESS BAR
// ============================================================================

interface ScrollProgressBarProps {
  className?: string;
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
}

export function ScrollProgressBar({
  className = '',
  color = 'hsl(262 83% 58%)',
  height = 3,
  position = 'top',
}: ScrollProgressBarProps) {
  const progress = useScrollProgress();

  return (
    <motion.div
      className={`fixed left-0 right-0 z-50 ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
      style={{
        height: `${height}px`,
        background: color,
        transformOrigin: 'left',
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress / 100 }}
      transition={{ duration: 0.1, ease: 'linear' }}
    />
  );
}

// ============================================================================
// MAGNETIC BUTTON - Premium micro-interaction
// ============================================================================

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className = '',
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = ref.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const button = ref.current;
    if (!button) return;

    button.style.transform = 'translate3d(0, 0, 0) scale(1)';
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
      }}
    >
      {children}
    </button>
  );
}

// ============================================================================
// TEXT REVEAL - Character by character animation
// ============================================================================

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function TextReveal({ text, className = '', delay = 0, stagger = 0.03 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.5, once: true });

  const letters = text.split('');

  return (
    <div ref={ref} className={className} aria-label={text}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            delay: delay + i * stagger,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1] as any,
          }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}
