import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Button from '../common/Button';

const MessageForm = ({ onSend, loading, serverError }) => {
  const [form, setForm] = useState({ content: '', receiver: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.content.trim()) errs.content = 'Message content is required';
    if (!form.receiver) errs.receiver = 'Receiver is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSend(form);
    setForm((prev) => ({ ...prev, content: '' }));
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-3">
      <Input id="receiver" name="receiver" label="Receiver ID" value={form.receiver} onChange={handleChange} error={errors.receiver} />
      <Input
        id="content"
        name="content"
        label="Message"
        value={form.content}
        onChange={handleChange}
        error={errors.content}
        placeholder="Type your message here"
      />
      {serverError && <div className="text-red-600">{serverError}</div>}
      <Button type="submit" disabled={loading} className="self-start">
        {loading ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};

MessageForm.propTypes = {
  onSend: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  serverError: PropTypes.string,
};

MessageForm.defaultProps = {
  loading: false,
  serverError: '',
};

export default MessageForm;
