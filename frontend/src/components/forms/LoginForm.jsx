import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Button from '../common/Button';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // lightweight icon set

const LoginForm = ({ onSubmit, loading, serverError }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(form.email.trim())
    )
      errs.email = 'Enter a valid email';
    if (!form.password.trim()) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white max-w-md mx-auto p-8 rounded-lg border border-black shadow-lg w-full"
    >
      <h2 className="text-3xl font-bold mb-6 text-black select-none text-center">
        Login to Your Account
      </h2>

      {/* Email Input */}
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="you@example.com"
        className="text-black placeholder-gray-400"
      />

      {/* Password Input with Toggle */}
      <div className="relative">
        <Input
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          className="text-black placeholder-gray-400 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-gray-600 hover:text-black focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p
            className="text-red-700 text-sm text-center select-none"
            role="alert"
          >
            {serverError}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full mt-8 bg-black text-white hover:bg-gray-900 focus:ring-4 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </Button>

      {/* Register Navigation */}
      <p className="mt-6 text-center text-sm text-gray-700 select-none">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="text-black font-semibold hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  serverError: PropTypes.string,
};

LoginForm.defaultProps = {
  loading: false,
  serverError: '',
};

export default LoginForm;
