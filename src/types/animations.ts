/**
 * Type definitions for Framer Motion animations
 */

import type { Transition } from 'framer-motion';

export type EaseType = [number, number, number, number];

export interface CustomTransition extends Transition {
  ease?: EaseType;
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
    transition?: {
      staggerChildren?: number;
      delayChildren?: number;
      ease?: EaseType;
      duration?: number;
    };
  };
}
