// Framer Motion Animation Presets and other grouped animations

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
  },

  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4 }
  },

  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4 }
  },

  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4 }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 }
  },

  scaleInCenter: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
    transition: { duration: 0.4, type: "spring", stiffness: 300, damping: 20 }
  },

  slideInUp: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  slideInDown: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  slideInLeft: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  slideInRight: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },

  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2 }
  },

  hoverLift: {
    whileHover: { y: -5, scale: 1.02 },
    whileTap: { y: 0, scale: 0.98 },
    transition: { duration: 0.2 }
  },

  hoverGlow: {
    whileHover: { 
      boxShadow: "0 0 25px rgba(255,255,255,0.2)",
      scale: 1.02
    },
    transition: { duration: 0.3 }
  },

  buttonPress: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.1 }
  },

  buttonBounce: {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },

  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  },

  pulse: {
    animate: { 
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7]
    },
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  },

  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { 
      duration: 1, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  },

  pageTransition: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.5, ease: "easeInOut" }
  },

  modalTransition: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  backdropTransition: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  floatingAnimation: {
    animate: {
      y: [-20, 20, -20],
      rotate: [0, 5, 0, -5, 0],
    },
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },

  typewriter: (text, delay = 0.05) => ({
    animate: {
      width: ["0%", "100%"]
    },
    transition: {
      duration: text.length * delay,
      ease: "linear"
    }
  }),

  drawPath: {
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 2, ease: "easeInOut" }
  },

  slideInTop: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  slideInBottom: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },

  cardHover: {
    whileHover: { 
      y: -8,
      scale: 1.02,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  cardTap: {
    whileTap: { scale: 0.98 },
    transition: { duration: 0.1 }
  },

  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    whileHover: { x: 10, backgroundColor: "rgba(255,255,255,0.1)" },
    transition: { duration: 0.3 }
  },

  navSlide: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    transition: { duration: 0.3, ease: "easeOut" }
  },

  tabIndicator: {
    layoutId: "activeTab",
    transition: { duration: 0.3, ease: "easeOut" }
  },

  formField: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  },

  errorShake: {
    animate: { x: [-10, 10, -10, 10, 0] },
    transition: { duration: 0.5 }
  },

  checkmark: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { duration: 0.5, type: "spring", stiffness: 300, damping: 20 }
  },

  successPulse: {
    animate: { 
      scale: [1, 1.1, 1],
      boxShadow: [
        "0 0 0 0 rgba(34, 197, 94, 0.4)",
        "0 0 0 10px rgba(34, 197, 94, 0)",
        "0 0 0 0 rgba(34, 197, 94, 0)"
      ]
    },
    transition: { duration: 1, repeat: 2 }
  },

  createDelayedAnimation: (animation, delay) => ({
    ...animation,
    transition: { ...animation.transition, delay }
  }),

  createStaggeredChildren: (children, stagger = 0.1) => ({
    animate: {
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1
      }
    }
  }),
};
