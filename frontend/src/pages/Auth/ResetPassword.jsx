import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import * as authService from '../../api/authService';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authService.resetPassword({ token, password });
      if (response.data.success) {
        setMessage('Password reset successful. Redirecting to login...');
        toast.success('Password reset successful');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 mt-16 bg-white border border-black rounded shadow-sm text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Reset Password</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="password"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          placeholder="Enter new password"
        />
        {message && <div className="text-green-700">{message}</div>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </main>
  );
};

export default ResetPassword;
