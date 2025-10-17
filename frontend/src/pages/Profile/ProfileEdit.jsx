import React, { useEffect, useState, useRef } from 'react';
import * as userService from '../../api/userService';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/ui/Avatar';
import { toast } from 'react-toastify';

const ProfileEdit = () => {
  const [form, setForm] = useState({ name: '', phone: '', bio: '', address: '', avatar: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    userService
      .getProfile()
      .then(({ data }) => setForm({ ...data.data, avatar: data.data.avatar ? `/uploads/avatars/${data.data.avatar}` : null }))
      .catch(() => {
        setError('Failed to load profile');
        toast.error('Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview image
    setForm((prev) => ({ ...prev, avatar: URL.createObjectURL(file) }));

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await userService.uploadAvatar(formData);
      toast.success('Avatar uploaded successfully');
      // Update avatar preview to server file url
      setForm((prev) => ({ ...prev, avatar: res.data.data.avatarUrl }));
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { avatar, ...updateData } = form; // exclude local preview URL if needed
      await userService.updateProfile(updateData);
      toast.success('Profile updated successfully');
    } catch {
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader className="mx-auto mt-20" />;

  return (
    <main className="max-w-lg mx-auto mt-12 p-6 bg-white border border-black rounded shadow-sm text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Profile</h1>
      <div className="flex flex-col items-center mb-6">
        <Avatar src={form.avatar} alt={form.name || 'User Avatar'} size={96} className="mb-4" />
        <input
          aria-label="Change Avatar"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current.click()} className="w-48 mb-4">
          Change Avatar
        </Button>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input id="name" name="name" label="Name" value={form.name} onChange={handleChange} />
        <Input id="phone" name="phone" label="Phone" value={form.phone || ''} onChange={handleChange} />
        <Input id="bio" name="bio" label="Bio" type="textarea" value={form.bio || ''} onChange={handleChange} />
        <Input id="address" name="address" label="Address" value={form.address || ''} onChange={handleChange} />
        {error && <p className="text-red-600 my-2 text-center">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </main>
  );
};

export default ProfileEdit;
