import React, { useState } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import * as userService from '../../api/userService';
import { toast } from 'react-toastify';

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    if (!form.newPassword) errs.newPassword = 'New password is required';
    if (form.newPassword && form.newPassword.length < 8)
      errs.newPassword = 'New password must be at least 8 characters';
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error changing password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 mt-16 bg-white border border-black rounded shadow-sm text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Change Password</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          label="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="New Password"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Changing...' : 'Change Password'}
        </Button>
      </form>
    </main>
  );
};

export default ChangePassword;
