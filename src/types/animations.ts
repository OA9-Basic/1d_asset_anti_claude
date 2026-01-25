/**
 * Type definitions for Framer Motion animations
 */

export type EaseType = [number, number, number, number];

export interface CustomTransition {
  duration?: number;
  ease?: EaseType | string;
  delay?: number;
  type?: 'tween' | 'spring' | 'just';
  staggerChildren?: number;
  delayChildren?: number;
}

export interface Variants {
  hidden?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  visible?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
    transition?: CustomTransition;
  };
}

export interface StaggerVariants extends Variants {
  visible?: {
    opacity?: number;
    y?: number;
    x?: number;
    scale?: number;
    transition?: CustomTransition;
  };
}
