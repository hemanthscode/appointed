import React, { useState } from 'react';
import { Layout } from '../components/common';
import userService from '../services/userService';
import { useToast } from '../contexts/ToastContext';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.addToast('Password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.addToast(error.message, 'error');
    }
    setSubmitting(false);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto my-20 p-6 bg-black rounded-md text-white font-sans">
        <h1 className="text-3xl mb-6 font-semibold">Change Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Current password"
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white text-white"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full p-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white text-white"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-white rounded text-black font-bold hover:bg-gray-200 transition"
          >
            {submitting ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ChangePasswordPage;
