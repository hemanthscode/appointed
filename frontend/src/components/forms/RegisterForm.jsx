import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Dropdown from '../common/Dropdown';
import Button from '../common/Button';
import { DEPARTMENT_OPTIONS, USER_YEARS } from '../../utils/constants';
import { Link } from 'react-router-dom';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
];

const RegisterForm = ({ onSubmit, loading, serverError }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
    year: '',
    subject: '',
  });

  const [errors, setErrors] = useState({});

  // Reset dependent fields when role changes
  useEffect(() => {
    if (form.role === 'student') {
      setForm((prev) => ({ ...prev, subject: '' }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.subject;
        return newErrors;
      });
    } else if (form.role === 'teacher') {
      setForm((prev) => ({ ...prev, year: '' }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.year;
        return newErrors;
      });
    } else {
      setForm((prev) => ({ ...prev, year: '', subject: '' }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.year;
        delete newErrors.subject;
        return newErrors;
      });
    }
  }, [form.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errs = {};
    
    // Name validation
    if (!form.name.trim()) {
      errs.name = 'Name is required';
    } else if (form.name.trim().length > 50) {
      errs.name = 'Name cannot be more than 50 characters';
    }
    
    // Email validation
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email';
    }
    
    // Password validation
    if (!form.password.trim()) {
      errs.password = 'Password is required';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    
    // Role validation
    if (!form.role) {
      errs.role = 'Role is required';
    }
    
    // Department validation
    if (!form.department) {
      errs.department = 'Department is required';
    }
    
    // Role-specific validations
    if (form.role === 'student' && !form.year) {
      errs.year = 'Year is required';
    }
    
    if (form.role === 'teacher' && !form.subject.trim()) {
      errs.subject = 'Subject is required';
    }
    
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Prepare payload exactly as backend expects
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role,
      department: form.department,
    };

    // Add role-specific fields
    if (form.role === 'student') {
      payload.year = form.year;
    }
    
    if (form.role === 'teacher') {
      payload.subject = form.subject.trim();
    }

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white max-w-md mx-auto p-8 rounded-lg border border-black shadow-lg w-full"
    >
      <h2 className="text-3xl font-bold mb-6 text-black select-none text-center">
        Create an Account
      </h2>

      <Input
        id="name"
        name="name"
        label="Full Name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter your full name"
        className="text-black placeholder-gray-400"
        maxLength={50}
      />

      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="your.email@example.com"
        className="text-black placeholder-gray-400"
      />

      <Input
        id="password"
        name="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Minimum 8 characters"
        className="text-black placeholder-gray-400"
      />

      <Dropdown
        id="role"
        name="role"
        label="Role"
        options={ROLE_OPTIONS}
        value={form.role}
        onChange={handleChange}
        error={errors.role}
        placeholder="Select your role"
      />

      <Dropdown
        id="department"
        name="department"
        label="Department"
        options={DEPARTMENT_OPTIONS}
        value={form.department}
        onChange={handleChange}
        error={errors.department}
        placeholder="Select your department"
      />

      {form.role === 'student' && (
        <Dropdown
          id="year"
          name="year"
          label="Year"
          options={USER_YEARS.map((y) => ({ value: y, label: y }))}
          value={form.year}
          onChange={handleChange}
          error={errors.year}
          placeholder="Select your year"
        />
      )}

      {form.role === 'teacher' && (
        <Input
          id="subject"
          name="subject"
          label="Subject"
          value={form.subject}
          onChange={handleChange}
          error={errors.subject}
          placeholder="e.g., Mathematics, Physics, Chemistry"
          className="text-black placeholder-gray-400"
        />
      )}

      {serverError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm text-center select-none" role="alert">
            {serverError}
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full mt-8 bg-black text-white hover:bg-gray-900 focus:ring-4 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Registering...' : 'Register'}
      </Button>

      <p className="mt-6 text-center text-sm text-gray-700 select-none">
        Already have an account?{' '}
        <Link to="/login" className="text-black font-semibold hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  serverError: PropTypes.string,
};

RegisterForm.defaultProps = {
  loading: false,
  serverError: '',
};

export default RegisterForm;