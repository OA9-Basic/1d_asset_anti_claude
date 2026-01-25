/**
 * Framer Motion Animation Variants & Presets
 *
 * A comprehensive collection of reusable animation variants for consistent,
 * performant animations throughout the application.
 */

import { Variants, Transition } from 'framer-motion'

// ============================================================================
// ENTRANCE ANIMATIONS
// ============================================================================

/**
 * Fade in from bottom - Default entrance animation
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

/**
 * Fade in from top
 */
export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

/**
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

/**
 * Fade in from right
 */
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

/**
 * Simple fade in/out
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Scale in from smaller
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

/**
 * Slide in from left (no fade)
 */
export const slideInLeft: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0 },
  exit: { x: '-100%' },
}

/**
 * Slide in from right (no fade)
 */
export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
}

/**
 * Slide up from bottom
 */
export const slideInUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

// ============================================================================
// STAGGERED ANIMATIONS
// ============================================================================

/**
 * Container for staggered children animations
 * Use with staggerItem for list animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

/**
 * Item for staggered list animations
 * Pairs with staggerContainer
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

/**
 * Fast stagger (0.05s delay between items)
 */
export const staggerFastContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

/**
 * Slow stagger (0.15s delay between items)
 */
export const staggerSlowContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

/**
 * Stagger from sides (alternating left/right)
 */
export const staggerFromSidesContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerFromSidesItem = (index: number): Variants => ({
  hidden: { opacity: 0, x: index % 2 === 0 ? -30 : 30 },
  show: { opacity: 1, x: 0 },
})

// ============================================================================
// HOVER & TAP INTERACTIONS
// ============================================================================

/**
 * Hover lift effect - card rises on hover
 */
export const hoverLift = {
  whileHover: { scale: 1.02, y: -4 },
  whileTap: { scale: 0.98 },
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
  },
}

/**
 * Hover scale only
 */
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
  },
}

/**
 * Subtle hover glow
 */
export const hoverGlow = {
  whileHover: {
    scale: 1.02,
    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.2)',
  },
  transition: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 17,
  },
}

/**
 * Button press feedback
 */
export const buttonTap = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 15,
  },
}

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

/**
 * Page slide from right
 */
export const pageSlideIn: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

/**
 * Page fade with scale
 */
export const pageFadeScale: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
}

/**
 * Page slide up
 */
export const pageSlideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// ============================================================================
// MODAL & DIALOG ANIMATIONS
// ============================================================================

/**
 * Modal fade in with backdrop blur
 */
export const modalFadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Modal scale up from center
 */
export const modalScaleUp: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
}

/**
 * Modal slide from bottom
 */
export const modalSlideUp: Variants = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
}

// ============================================================================
// SIDEBAR & NAVIGATION
// ============================================================================

/**
 * Sidebar items staggered entrance
 */
export const sidebarStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
}

export const sidebarItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

/**
 * Mobile nav slide up
 */
export const mobileNavSlideUp: Variants = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

// ============================================================================
// LIST & GRID ANIMATIONS
// ============================================================================

/**
 * List items cascade in
 */
export const listCascade: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

/**
 * Grid items stagger entrance
 */
export const gridStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

export const gridItem: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
}

// ============================================================================
// SPECIAL EFFECTS
// ============================================================================

/**
 * Shimmer/skeleton loading animation
 */
export const shimmer: Variants = {
  animate: {
    x: ['-100%', '100%'],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'linear',
  },
}

/**
 * Pulse animation
 */
export const pulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [0.98, 1, 0.98],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

/**
 * Bounce animation
 */
export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 0.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

/**
 * Rotate animation
 */
export const rotate: Variants = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
}

/**
 * Shake animation for errors
 */
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
  },
  transition: {
    duration: 0.4,
  },
}

// ============================================================================
// LOADING STATES
// ============================================================================

/**
 * Loading spinner rotation
 */
export const spinner = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
}

/**
 * Dots loading animation
 */
export const loadingDots = {
  animate: {
    opacity: [0.2, 1, 0.2],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

// ============================================================================
// TAB TRANSITIONS
// ============================================================================

/**
 * Tab content fade slide
 */
export const tabContent: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

/**
 * Tab indicator slide
 */
export const tabIndicator = {
  transition: {
    type: 'spring' as const,
    bounce: 0.2,
    duration: 0.6,
  },
}

// ============================================================================
// PROGRESS & COUNTING ANIMATIONS
// ============================================================================

/**
 * Progress bar fill animation
 */
export const progressFill = (progress: number) => ({
  initial: { width: 0 },
  animate: { width: `${progress}%` },
  transition: {
    duration: 0.8,
    ease: 'easeOut',
  },
})

/**
 * Count up animation for numbers
 */
export const countUp = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 15,
  },
}

// ============================================================================
// CARD SPECIFIC ANIMATIONS
// ============================================================================

/**
 * Card entrance with staggered internal elements
 */
export const cardEntrance: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.4,
    ease: [0.25, 0.4, 0.25, 1],
  },
}

/**
 * Card hover 3D effect
 */
export const card3D = {
  whileHover: {
    scale: 1.02,
    rotateX: 2,
    rotateY: 2,
    y: -4,
  },
  transition: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
}

// ============================================================================
// UTILITY TRANSITIONS
// ============================================================================

/**
 * Default spring transition
 */
export const springTransition: Transition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
}

/**
 * Smooth ease transition
 */
export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.4, 0.25, 1],
}

/**
 * Fast snappy transition
 */
export const snappyTransition: Transition = {
  duration: 0.15,
  ease: 'easeOut',
}

/**
 * Slow smooth transition
 */
export const slowTransition: Transition = {
  duration: 0.5,
  ease: [0.25, 0.4, 0.25, 1],
}

// ============================================================================
// ACCESSIBILITY
// ============================================================================

/**
 * Check for reduced motion preference
 */
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get safe animation variants that respect reduced motion
 */
export const getSafeVariants = (variants: Variants): Variants => {
  if (shouldReduceMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }
  }
  return variants
}

// ============================================================================
// PRESET COMBINATIONS
// ============================================================================

/**
 * Complete page entrance preset
 */
export const pageEntrance = {
  container: fadeInUp,
  stagger: staggerContainer,
  item: staggerItem,
}

/**
 * Card grid preset
 */
export const cardGrid = {
  container: gridStagger,
  item: gridItem,
}

/**
 * List preset
 */
export const listAnimation = {
  container: listCascade,
  item: listItem,
}

/**
 * Modal preset
 */
export const modalAnimation = {
  backdrop: modalFadeIn,
  content: modalScaleUp,
}
