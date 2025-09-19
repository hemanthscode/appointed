import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/common';
import { Button } from '../components/ui';
import { ROUTES, ANIMATIONS } from '../data';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => navigate(ROUTES.HOME);
  const goBack = () => navigate(-1);

  return (
    <Layout showHeader={false}>
      {/* Logo */}
      <motion.div 
        className="absolute top-6 left-6 flex items-center space-x-2 cursor-pointer"
        onClick={goHome}
        {...ANIMATIONS.scaleOnHover}
        {...ANIMATIONS.slideInFromLeft}
      >
        <BookOpen className="h-8 w-8" />
        <span className="text-xl font-bold">Appointed</span>
      </motion.div>

      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          className="text-center max-w-md"
          {...ANIMATIONS.fadeInUp}
        >
          <motion.h1 
            className="text-8xl font-black mb-4"
            animate={{ 
              textShadow: [
                "0 0 0px rgba(255,255,255,0.5)",
                "0 0 20px rgba(255,255,255,0.8)",
                "0 0 0px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.h1>
          
          <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={goHome}
              icon={<Home className="h-5 w-5" />}
            >
              Go Home
            </Button>
            
            <Button
              variant="secondary"
              onClick={goBack}
              icon={<ArrowLeft className="h-5 w-5" />}
            >
              Go Back
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
