export const ANIMATIONS = {
  fadeInUp: {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  },
  slideInFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  },
  slideInFromTop: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4 }
  },
  slideInFromBottom: {
    initial: { y: 100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.4 }
  },
  scaleOnHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  },
  spin: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  },
  pulse: {
    animate: { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  bounce: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
  },
};
