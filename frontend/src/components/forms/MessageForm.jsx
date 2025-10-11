import React, { useState } from 'react';
import { Button, Input, Textarea } from '../ui';
import { validateMessage } from '../../utils';

const MessageForm = ({ onSubmit, loading }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors } = validateMessage({ content });
    if (!isValid) {
      setError(errors.content);
      return;
    }
    setError(null);
    onSubmit({ content, files });
    setContent('');
    setFiles([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data" noValidate>
      <Textarea
        label="Message"
        name="content"
        value={content}
        onChange={handleContentChange}
        error={error}
        disabled={loading}
        rows={3}
        required
      />
      <input type="file" multiple onChange={handleFileChange} disabled={loading} />
      <Button type="submit" disabled={loading} loading={loading} fullWidth>
        Send
      </Button>
    </form>
  );
};

export default MessageForm;
