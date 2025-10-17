import React, { useState } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import * as authService from '../../api/authService';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await authService.forgotPassword(email);
      setMessage('Password reset email sent. Check your inbox.');
      toast.success('Password reset email sent.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Email could not be sent';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 mt-16 bg-white border border-black rounded shadow-sm text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Forgot Password</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          placeholder="you@example.com"
        />
        {message && <div className="text-green-700">{message}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Send Reset Email'}
        </Button>
      </form>
    </main>
  );
};

export default ForgotPassword;
