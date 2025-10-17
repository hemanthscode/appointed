import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/forms/LoginForm';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleLogin = async (credentials) => {
    setLoading(true);
    setServerError('');

    try {
      const result = await login(credentials);

      if (result.success) {
        // Redirect to the previous page or to profile
        const from = location.state?.from?.pathname || '/profile';
        navigate(from, { replace: true });
      } else if (result.status === 'pending') {
        // Navigate to pending approval page
        navigate('/pending-approval');
      } else if (result.status === 'inactive') {
        // Navigate to inactive account page
        navigate('/account-inactive');
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMsg = error.response?.data?.message;

      if (errorMsg && errorMsg.toLowerCase().includes('pending')) {
        navigate('/pending-approval');
      } else if (errorMsg && errorMsg.toLowerCase().includes('inactive')) {
        navigate('/account-inactive');
      } else {
        setServerError(errorMsg || 'Invalid email or password. Please try again.');
        toast.error(errorMsg || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-black">
      <LoginForm onSubmit={handleLogin} loading={loading} serverError={serverError} />
    </main>
  );
};

export default Login;
