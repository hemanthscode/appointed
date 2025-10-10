import React, { useState } from 'react';

const AvatarUpload = ({ avatarUrl, onUpload }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(avatarUrl);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    onUpload(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
      <div className="flex flex-col items-center">
        {preview ? (
          <img src={preview} alt="Avatar Preview" className="w-32 h-32 rounded-full object-cover" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">No Avatar</div>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button type="submit" className="btn btn-primary w-full py-2 rounded" disabled={!file}>
        Upload Avatar
      </button>
    </form>
  );
};

export default AvatarUpload;
