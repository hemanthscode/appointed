import React, { useState, useRef, useEffect } from 'react';

const AvatarUpload = ({ currentAvatar, onFileSelect, disabled = false }) => {
  const [preview, setPreview] = useState(currentAvatar);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(currentAvatar);
  }, [currentAvatar]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4 max-w-xs w-full mx-auto select-none">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        className="rounded-full w-32 h-32 bg-gray-800 cursor-pointer overflow-hidden flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Upload avatar"
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar Preview"
            className="w-full h-full object-cover rounded-full"
            draggable={false}
          />
        ) : (
          <span className="text-gray-400 text-4xl font-semibold">?</span>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default AvatarUpload;
