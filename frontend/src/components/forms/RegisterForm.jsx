import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import { validateRegisterForm } from '../../utils/validators';
import { DEPARTMENTS, USER_YEARS } from '../../utils/constants';
import { useSubjects } from '../../hooks/useMetadata';

const RegisterForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    year: '',
    subject: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});

  // Load subjects for selected department
  const { subjects, loading: subjectsLoading } = useSubjects(formData.department);

  useEffect(() => {
    if (formData.role === 'student') {
      setFormData(prev => ({ ...prev, subject: '' }));
    } else if (formData.role === 'teacher') {
      setFormData(prev => ({ ...prev, year: '' }));
    } else {
      setFormData(prev => ({ ...prev, year: '', subject: '' }));
    }
  }, [formData.role]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (serverErrors[name]) setServerErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      department: formData.department,
      ...(formData.role === 'student' ? { year: formData.year } : {}),
      ...(formData.role === 'teacher' ? { subject: formData.subject } : {}),
    };
    if (payload.year === '') delete payload.year;
    if (payload.subject === '') delete payload.subject;

    const validation = validateRegisterForm(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setServerErrors({});
    try {
      await onSubmit(payload);
    } catch (err) {
      if (err?.errors) {
        const backendErrors = {};
        err.errors.forEach(({ param, msg }) => {
          backendErrors[param] = msg;
        });
        setServerErrors(backendErrors);
      } else if (err.message) {
        setServerErrors({ general: err.message });
      } else {
        setServerErrors({ general: 'Registration failed' });
      }
    }
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
  ];
  const departmentOptions = DEPARTMENTS.map(dept => ({ value: dept, label: dept }));
  const yearOptions = USER_YEARS.map(year => ({ value: year, label: year }));
  const subjectOptions = subjects.map(sub => ({ value: sub, label: sub }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {serverErrors.general && <div className="text-red-500 text-sm mb-2" role="alert">{serverErrors.general}</div>}

      <Input
        label="Full Name"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Enter your full name"
        error={errors.name || serverErrors.name}
        required
        disabled={loading}
      />

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter your email"
        error={errors.email || serverErrors.email}
        required
        disabled={loading}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          error={errors.password || serverErrors.password}
          required
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-400"
          disabled={loading}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="User Role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          options={roleOptions}
          placeholder="Select role"
          error={errors.role || serverErrors.role}
          required
          disabled={loading}
        />
        <Select
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          options={departmentOptions}
          placeholder="Select department"
          error={errors.department || serverErrors.department}
          required
          disabled={loading}
        />
      </div>

      {formData.role === 'student' && (
        <Select
          label="Academic Year"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          options={yearOptions}
          placeholder="Select year"
          error={errors.year || serverErrors.year}
          required
          disabled={loading}
        />
      )}

      {formData.role === 'teacher' && (
        <Select
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          options={subjectOptions}
          placeholder="Select subject"
          error={errors.subject || serverErrors.subject}
          required
          disabled={loading || subjects.length === 0}
        />
      )}

      <Button type="submit" variant="primary" size="large" loading={loading} fullWidth disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default RegisterForm;
