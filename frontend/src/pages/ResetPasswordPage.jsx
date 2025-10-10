import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Button, Input } from '../components/ui';
import authService from '../services/authService';
import { useToast } from '../contexts/ToastContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.addToast('Reset token missing', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      toast.addToast('Password reset successful. Please login.', 'success');
      navigate('/login');
    } catch (error) {
      toast.addToast(error.message, 'error');
    }
    setSubmitting(false);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto my-20 p-6 bg-black rounded-md text-white font-sans">
        <h1 className="text-3xl mb-6 font-semibold">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={submitting}
          />
          <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
            {submitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
