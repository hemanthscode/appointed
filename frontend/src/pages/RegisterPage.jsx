import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/common';
import { RegisterForm } from '../components/forms';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, ANIMATIONS } from '../utils';
import { BookOpen } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, authLoading } = useAuth();
  const [formError, setFormError] = useState(null);

  const handleRegister = async (formData) => {
    setFormError(null);
    try {
      const user = await register(formData);
      if (user) navigate(ROUTES.PROFILE);
    } catch (err) {
      // Show detailed backend validation errors if available
      if (err?.errors) {
        setFormError('Please fix the errors in the form');
      } else if (err.message) {
        setFormError(err.message);
      } else {
        setFormError('Registration failed');
      }
    }
  };

  const goHome = () => navigate(ROUTES.HOME);
  const goToLogin = () => navigate(ROUTES.LOGIN);

  return (
    <Layout showHeader={false}>
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
        <motion.div className="w-full max-w-md" {...ANIMATIONS.fadeInUp}>
          <Card>
            <h2 className="text-3xl font-bold mb-8 text-center">Create Account</h2>
            {formError && (
              <div
                role="alert"
                className="mb-4 text-center text-red-500 text-sm font-semibold"
              >
                {formError}
              </div>
            )}
            <RegisterForm onSubmit={handleRegister} loading={authLoading} />
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
