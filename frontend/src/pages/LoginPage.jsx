import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/common';
import { LoginForm } from '../components/forms';
import { Card } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, ANIMATIONS } from '../utils';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, authLoading } = useAuth();

  const handleLogin = async (formData) => {
    try {
      const user = await login(formData);
      if (user) navigate(ROUTES.PROFILE);
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  };

  const goHome = () => navigate(ROUTES.HOME);
  const goToRegister = () => navigate(ROUTES.REGISTER);

  return (
    <Layout showHeader={false}>
      <motion.div
        className="absolute top-6 left-6 flex items-center space-x-2 cursor-pointer"
        onClick={goHome}
        {...ANIMATIONS.scaleOnHover}
        {...ANIMATIONS.slideInFromLeft}
      >
        <span className="text-xl font-bold">Appointed</span>
      </motion.div>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div className="w-full max-w-md" {...ANIMATIONS.fadeInUp}>
          <Card>
            <h2 className="text-3xl font-bold mb-8 text-center">Welcome Back</h2>
            <LoginForm onSubmit={handleLogin} loading={authLoading} />
            <p className="text-center text-gray-400 mt-8">
              Don&apos;t have an account?{' '}
              <button onClick={goToRegister} className="text-white hover:underline font-medium">
                Register here
              </button>
            </p>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default LoginPage;
