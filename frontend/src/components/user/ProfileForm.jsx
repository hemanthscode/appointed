import React, { useState, useEffect } from 'react';

const ProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    bio: '',
    office: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        office: user.office || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block mb-1 font-semibold">Name</label>
        <input required type="text" name="name" className="w-full border px-3 py-2 rounded" value={formData.name} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Phone</label>
        <input
          type="text"
          name="phone"
          className="w-full border px-3 py-2 rounded"
          value={formData.phone}
          onChange={handleChange}
          placeholder="e.g., +1234567890"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Address</label>
        <input type="text" name="address" className="w-full border px-3 py-2 rounded" value={formData.address} onChange={handleChange} />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Bio</label>
        <textarea
          name="bio"
          rows="3"
          className="w-full border px-3 py-2 rounded"
          value={formData.bio}
          onChange={handleChange}
          maxLength={500}
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Office</label>
        <input type="text" name="office" className="w-full border px-3 py-2 rounded" value={formData.office} onChange={handleChange} />
      </div>
      <button type="submit" className="btn btn-primary w-full py-2 rounded">
        Update Profile
      </button>
    </form>
  );
};

export default ProfileForm;
