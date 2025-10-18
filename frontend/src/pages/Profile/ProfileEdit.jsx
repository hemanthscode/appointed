import React, { useEffect, useState, useRef } from 'react';
import * as userService from '../../api/userService';
import Loader from '../../components/common/Loader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/ui/Avatar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { User, Phone, FileText, MapPin, ArrowLeft } from 'lucide-react';

const ProfileEdit = () => {
  const [form, setForm] = useState({ name: '', phone: '', bio: '', address: '', avatar: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    userService.getProfile()
      .then(({ data }) => {
        const p = data.data;
        setForm({
          name: p.name || '',
          phone: p.phone || '',
          bio: p.bio || '',
          address: p.address || '',
          avatar: p.avatar ? `/uploads/avatars/${p.avatar}` : null,
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setForm((prev) => ({ ...prev, avatar: URL.createObjectURL(file) }));
    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await userService.uploadAvatar(formData);
      toast.success('Avatar uploaded');
      setForm((prev) => ({ ...prev, avatar: res.data.data.avatarUrl }));
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { avatar, ...data } = form;
      await userService.updateProfile(data);
      toast.success('Profile updated');
      setTimeout(() => navigate('/profile'), 800);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size="xl" />
      </div>
    );

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10 max-w-5xl mx-auto">

      <div className="grid grid-cols-12 gap-6">

        {/* Avatar Section - compact, centered */}
        <section className="col-span-12 sm:col-span-4 bg-white border-2 border-black rounded-2xl p-6 flex flex-col items-center sticky top-6 self-start gap-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" aria-hidden="true" />
            Profile Picture
          </h2>
          <div className="relative">
            <Avatar src={form.avatar} alt={form.name} size={120} className="border-4 border-black shadow" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <Loader size="md" className="text-white" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            aria-label="Upload avatar"
          />
          <Button
            onClick={() => fileInputRef.current.click()}
            variant="outline"
            fullWidth
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
          <p className="text-xs text-gray-500 mt-1 text-center">Max 5MB</p>
          <Button
            variant="ghost"
            fullWidth
            className="mt-4"
            onClick={() => navigate('/profile')}
            aria-label="Back to Profile"
          >
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Back to Profile
          </Button>
        </section>

        {/* Form Section - compact cards arranged in vertical stack with internal grid for inputs */}
        <section className="col-span-12 sm:col-span-8 space-y-6">

          {/* Personal Info */}
          <div className="bg-white border-2 border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" aria-hidden="true" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="name"
                name="name"
                label="Full Name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
              <Input
                id="phone"
                name="phone"
                label="Phone Number"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                helperText="Include country code"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white border-2 border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" aria-hidden="true" />
              Bio
            </h2>
            <Input
              id="bio"
              name="bio"
              label=""
              type="textarea"
              placeholder="Tell us about yourself..."
              value={form.bio}
              onChange={handleChange}
              className="min-h-[110px] resize-y"
              maxLength={500}
              helperText={`${form.bio.length}/500`}
            />
          </div>

          {/* Address */}
          <div className="bg-white border-2 border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" aria-hidden="true" />
              Location
            </h2>
            <Input
              id="address"
              name="address"
              label="Address"
              placeholder="123 Main St, City"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="min-w-[110px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="min-w-[110px]"
              onClick={handleSubmit}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfileEdit;
