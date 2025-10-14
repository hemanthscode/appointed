import React, { useState } from 'react';
import { Button, Input, AvatarUpload, Textarea } from '../ui';

const ProfileForm = ({
  profile,
  loading,
  onSave,
  onAvatarUpload,
  hidePassword = false,
  passwordOnly = false,
  onCancel,
  onChangePassword,
}) => {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    address: profile.address || '',
    office: profile.office || '',
  });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleAvatarChange = (file) => {
    setAvatarFile(file);
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordOnly && onChangePassword) onChangePassword(passwords);
    else onSave(formData);
  };

  const handleAvatarUploadSubmit = async () => {
    if (avatarFile) {
      await onAvatarUpload(avatarFile);
      setAvatarFile(null);
    }
  };

  if (passwordOnly) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-md mx-auto space-y-6 px-4 py-6"
        noValidate
      >
        <Input
          label="Current Password"
          type="password"
          name="currentPassword"
          value={passwords.currentPassword}
          onChange={handlePasswordChange}
          error={passwordErrors.currentPassword}
          disabled={loading}
          required
        />
        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={passwords.newPassword}
          onChange={handlePasswordChange}
          error={passwordErrors.newPassword}
          disabled={loading}
          required
        />
        <div className="flex justify-between items-center">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Change Password
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full max-w-4xl mx-auto space-y-6 px-6 py-8"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-6">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
          />
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
          />
          <Textarea
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            disabled={loading}
          />
          <Input
            label="Office"
            name="office"
            value={formData.office}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col items-center space-y-6">
          <AvatarUpload
            currentAvatar={profile.avatarUrl || profile.avatar}
            onFileSelect={handleAvatarChange}
            disabled={loading}
          />
          <Button
            onClick={handleAvatarUploadSubmit}
            disabled={!avatarFile || loading}
            variant="secondary"
            size="medium"
            className="w-full"
          >
            Upload Avatar
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Save Profile
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
