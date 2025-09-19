import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Layout } from '../components/common';
import { RegisterForm } from '../components/forms';
import { Card } from '../components/ui';
import { useAuth } from '../hooks';
import { ROUTES, ANIMATIONS } from '../data';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const handleRegister = async (formData) => {
    const result = await register(formData);
    if (result.success) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  const goHome = () => navigate(ROUTES.HOME);
  const goToLogin = () => navigate(ROUTES.LOGIN);

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

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div 
          className="w-full max-w-md"
          {...ANIMATIONS.fadeInUp}
        >
          <Card>
            <h2 className="text-3xl font-bold mb-8 text-center">Create Account</h2>
            
            <RegisterForm onSubmit={handleRegister} loading={loading} />
            
            <p className="text-center text-gray-400 mt-8">
              Already have an account?{' '}
              <button
                onClick={goToLogin}
                className="text-white hover:underline font-medium bg-transparent border-none cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
