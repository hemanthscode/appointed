import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import Button from '../components/common/Button';
import { ANIMATIONS, ROUTES, LANDING_PAGE_CONTENT } from '../utils/constants';

const LandingPage = () => {
  const navigate = useNavigate();

  // Refs to sections for smooth scroll
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const benefitsRef = useRef(null);

  // Scroll helper
  const scrollToSection = (elRef) => {
    elRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handlers
  const navigateToLogin = () => navigate(ROUTES.LOGIN);
  const navigateToRegister = () => navigate(ROUTES.REGISTER);

  const iconMap = {
    CalendarDays,
    MessageSquare,
    UserCheck,
    Shield,
    Clock,
    GraduationCap,
  };

  const features = LANDING_PAGE_CONTENT.features.map((feature) => ({
    ...feature,
    icon: iconMap[feature.icon],
  }));

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="h-8 w-8" />
              <span className="text-xl font-bold">Appointed</span>
            </motion.div>

            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="hover:text-gray-300 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(howItWorksRef)}
                className="hover:text-gray-300 transition-colors cursor-pointer"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection(benefitsRef)}
                className="hover:text-gray-300 transition-colors cursor-pointer"
              >
                Benefits
              </button>
            </div>

            <div className="flex space-x-4">
              <Button onClick={navigateToLogin} size="small" className="whitespace-nowrap">
                Login
              </Button>
              <Button
                onClick={navigateToRegister}
                variant="secondary"
                size="small"
                className="whitespace-nowrap"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black/20"></div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={ANIMATIONS.staggerChildren}
          className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <motion.h1
            variants={ANIMATIONS.fadeInUp}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 select-none"
          >
            {LANDING_PAGE_CONTENT.hero.title.split(' ').slice(0, 2).join(' ')}
            <span className="block bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {LANDING_PAGE_CONTENT.hero.title.split(' ').slice(2).join(' ')}
            </span>
          </motion.h1>

          <motion.p
            variants={ANIMATIONS.fadeInUp}
            className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {LANDING_PAGE_CONTENT.hero.subtitle}
          </motion.p>

          <motion.div
            variants={ANIMATIONS.fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button onClick={navigateToRegister} size="large" icon={<ArrowRight className="h-5 w-5" />}>
              {LANDING_PAGE_CONTENT.hero.cta.primary}
            </Button>

            <Button
              variant="secondary"
              size="large"
              onClick={() => scrollToSection(howItWorksRef)}
              className="whitespace-nowrap"
            >
              {LANDING_PAGE_CONTENT.hero.cta.secondary}
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating icons */}
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-10 opacity-20 pointer-events-none"
        >
          <CalendarDays className="h-16 w-16" />
        </motion.div>
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 right-10 opacity-20 pointer-events-none"
        >
          <Users className="h-20 w-20" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={ANIMATIONS.staggerChildren}
            className="text-center mb-16 select-none"
          >
            <motion.h2 variants={ANIMATIONS.fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6">
              Powerful Features
            </motion.h2>

            <motion.p
              variants={ANIMATIONS.fadeInUp}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Everything you need to streamline academic appointments and enhance communication
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={ANIMATIONS.staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={ANIMATIONS.fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 h-80 flex flex-col justify-between hover:border-gray-600 transition-all duration-300"
              >
                <div>
                  <feature.icon className="h-12 w-12 mb-6 text-white" />
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed flex-grow">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={ANIMATIONS.staggerChildren}
            className="text-center mb-16 select-none"
          >
            <motion.h2 variants={ANIMATIONS.fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6">
              How It Works
            </motion.h2>

            <motion.p
              variants={ANIMATIONS.fadeInUp}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Simple steps to connect students and teachers efficiently
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={ANIMATIONS.staggerChildren}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {LANDING_PAGE_CONTENT.steps.map((step, index) => (
              <motion.div
                key={index}
                variants={ANIMATIONS.fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="text-center bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 h-80 flex flex-col justify-between"
              >
                <div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white text-black w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto select-none"
                  >
                    {step.step}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={ANIMATIONS.staggerChildren}
            className="text-center mb-16 select-none"
          >
            <motion.h2 variants={ANIMATIONS.fadeInUp} className="text-4xl sm:text-5xl font-bold mb-6">
              Why Choose Appointed?
            </motion.h2>

            <motion.p
              variants={ANIMATIONS.fadeInUp}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Transform your educational institution with modern appointment management
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={ANIMATIONS.staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {LANDING_PAGE_CONTENT.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={ANIMATIONS.fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800 h-80 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{benefit.description}</p>
                  <ul className="space-y-2">
                    {benefit.benefits.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-white" />
                        <span className="text-sm text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={ANIMATIONS.staggerChildren}
          >
            <motion.h2 variants={ANIMATIONS.fadeInUp} className="text-4xl sm:text-6xl font-bold mb-8 select-none">
              Ready to Transform
              <span className="block">Your Institution?</span>
            </motion.h2>

            <motion.p
              variants={ANIMATIONS.fadeInUp}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Join thousands of educational institutions already using Appointed to streamline their appointment processes.
            </motion.p>

            <motion.div
              variants={ANIMATIONS.fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button
                onClick={navigateToRegister}
                size="large"
                icon={<ArrowRight className="h-6 w-6" />}
                className="whitespace-nowrap"
              >
                Register Now
              </Button>

              <Button
                variant="secondary"
                size="large"
                onClick={() => scrollToSection(howItWorksRef)}
                className="whitespace-nowrap"
              >
                Schedule Demo
              </Button>
            </motion.div>

            <motion.p variants={ANIMATIONS.fadeInUp} className="text-gray-500 mt-8 select-none">
              No credit card required • Free setup • 24/7 support
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-gray-800 py-12 select-none"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center space-x-2 mb-4 md:mb-0 cursor-pointer select-none"
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpen className="h-8 w-8" />
              <span className="text-xl font-bold">Appointed</span>
            </motion.div>

            <div className="flex space-x-8 text-gray-400">
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Support</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 select-none">
            <p>&copy; 2025 Appointed. All rights reserved.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
