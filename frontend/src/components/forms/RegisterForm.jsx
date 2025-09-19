import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Shield } from 'lucide-react';
import { Button, Input, Select } from '../ui';
import { validateRegisterForm } from '../../utils/validators';
import { DEPARTMENTS, USER_YEARS } from '../../data/mockData';

const RegisterForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: '',
    department: '',
    year: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    onSubmit(formData);
  };

  const userTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' }
  ];

  const departmentOptions = DEPARTMENTS.map(dept => ({ value: dept, label: dept }));
  const yearOptions = USER_YEARS.map(year => ({ value: year, label: year }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        placeholder="Enter your full name"
        icon={<User className="h-4 w-4" />}
        error={errors.fullName}
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
        icon={<Mail className="h-4 w-4" />}
        error={errors.email}
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
          icon={<Lock className="h-4 w-4" />}
          error={errors.password}
          required
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
          disabled={loading}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="User Type"
          name="userType"
          value={formData.userType}
          onChange={handleInputChange}
          options={userTypeOptions}
          placeholder="Select user type"
          icon={<Shield className="h-4 w-4" />}
          error={errors.userType}
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
          error={errors.department}
          required
          disabled={loading}
        />
      </div>
      
      {/* Show year selection only for students */}
      {formData.userType === 'student' && (
        <Select
          label="Academic Year"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          options={yearOptions}
          placeholder="Select year"
          disabled={loading}
        />
      )}
      
      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={loading}
        fullWidth
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
