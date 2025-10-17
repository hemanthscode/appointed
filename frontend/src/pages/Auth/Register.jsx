import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../components/forms/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleRegister = async (userData) => {
    setLoading(true);
    setServerError('');

    try {
      const result = await register(userData);

      if (result.success) {
        // Navigate to success page with user details
        navigate('/registration-success', {
          state: {
            userName: result.user?.name || userData.name,
            userEmail: result.user?.email || userData.email,
            status: result.status
          },
          replace: true // Prevent going back to registration form
        });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setServerError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black p-6">
      <RegisterForm onSubmit={handleRegister} loading={loading} serverError={serverError} />
    </main>
  );
};

export default Register;
