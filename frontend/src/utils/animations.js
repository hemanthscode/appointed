// Framer Motion Animation Presets
export const ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  scaleOnHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  },
  
  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  }
};
// Basic animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4 }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.4 }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4 }
};

// Scale animations
export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3 }
};

export const scaleInCenter = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
  transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 20 }
};

// Slide animations
export const slideInUp = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInDown = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInLeft = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Stagger animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 }
};

export const hoverLift = {
  whileHover: { y: -5, scale: 1.02 },
  whileTap: { y: 0, scale: 0.98 },
  transition: { duration: 0.2 }
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 25px rgba(255,255,255,0.2)",
    scale: 1.02
  },
  transition: { duration: 0.3 }
};

// Button animations
export const buttonPress = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.1 }
};

export const buttonBounce = {
  whileHover: { scale: 1.1 },
  whileTap: { scale: 0.9 },
  transition: { type: "spring", stiffness: 400, damping: 10 }
};

// Loading animations
export const spin = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: "linear" }
};

export const pulse = {
  animate: { 
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7]
  },
  transition: { 
    duration: 2, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

export const bounce = {
  animate: { y: [0, -10, 0] },
  transition: { 
    duration: 1, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }
};

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.5, ease: "easeInOut" }
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const backdropTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

// Complex animations
export const floatingAnimation = {
  animate: {
    y: [-20, 20, -20],
    rotate: [0, 5, 0, -5, 0],
  },
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export const typewriter = (text, delay = 0.05) => ({
  animate: {
    width: ["0%", "100%"]
  },
  transition: {
    duration: text.length * delay,
    ease: "linear"
  }
});

export const drawPath = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
  transition: { duration: 2, ease: "easeInOut" }
};

// Notification animations
export const slideInTop = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const slideInBottom = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

// Card animations
export const cardHover = {
  whileHover: { 
    y: -8,
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const cardTap = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 }
};

// List item animations
export const listItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  whileHover: { x: 10, backgroundColor: "rgba(255,255,255,0.1)" },
  transition: { duration: 0.3 }
};

// Navigation animations
export const navSlide = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const tabIndicator = {
  layoutId: "activeTab",
  transition: { duration: 0.3, ease: "easeOut" }
};

// Form animations
export const formField = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 }
};

export const errorShake = {
  animate: { x: [-10, 10, -10, 10, 0] },
  transition: { duration: 0.5 }
};

// Success animations
export const checkmark = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { 
    duration: 0.5, 
    type: "spring", 
    stiffness: 300, 
    damping: 20 
  }
};

export const successPulse = {
  animate: { 
    scale: [1, 1.1, 1],
    boxShadow: [
      "0 0 0 0 rgba(34, 197, 94, 0.4)",
      "0 0 0 10px rgba(34, 197, 94, 0)",
      "0 0 0 0 rgba(34, 197, 94, 0)"
    ]
  },
  transition: { duration: 1, repeat: 2 }
};

// Animation utilities
export const createDelayedAnimation = (animation, delay) => ({
  ...animation,
  transition: { ...animation.transition, delay }
});

export const createStaggeredChildren = (children, stagger = 0.1) => ({
  animate: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.1
    }
  }
});

// Export grouped animations
export const pageAnimations = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  pageTransition
};

export const interactionAnimations = {
  hoverScale,
  hoverLift,
  hoverGlow,
  buttonPress,
  buttonBounce,
  cardHover,
  cardTap
};

export const modalAnimations = {
  modalTransition,
  backdropTransition,
  slideInUp,
  slideInDown,
  scaleIn,
  scaleInCenter
};

export const listAnimations = {
  staggerContainer,
  staggerItem,
  listItem,
  slideInLeft,
  slideInRight
};

export const loadingAnimations = {
  spin,
  pulse,
  bounce,
  floatingAnimation
};
