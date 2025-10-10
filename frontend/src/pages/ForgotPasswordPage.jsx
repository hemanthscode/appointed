import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Button, Input } from '../components/ui';
import authService from '../services/authService';
import { useToast } from '../contexts/ToastContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.forgotPassword(email);
      toast.addToast('Password reset email sent. Check your inbox.', 'success');
    } catch (error) {
      toast.addToast(error.message, 'error');
    }
    setSubmitting(false);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto my-20 p-6 bg-black rounded-md text-white font-sans">
        <h1 className="text-3xl mb-6 font-semibold">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />
          <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Reset Email'}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
