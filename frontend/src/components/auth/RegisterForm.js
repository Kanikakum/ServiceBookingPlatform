'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, getDefaultDashboardRoute } from '../../utils/routes';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#^~+=])[A-Za-z\d@$!%*?&_\-#^~+=]{8,}$/;

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      nextErrors.password =
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character';
    }

    if (!['CUSTOMER', 'PROVIDER'].includes(formData.role)) {
      nextErrors.role = 'Please select a valid account type';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) {
      setApiError(null);
      setFieldErrors(null);
    }
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setFieldErrors(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      // Redirect user to their role-specific dashboard
      const targetRoute = getDefaultDashboardRoute(user.role);
      router.push(targetRoute);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please verify your details.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white py-8 px-6 sm:px-10 rounded-sm shadow-sm border border-[#E5E5E5]">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create an Account</h2>
          <p className="text-sm text-gray-600 mt-1">
            Join our verified marketplace as a Customer or Service Provider
          </p>
        </div>

        {apiError && (
          <div className="mb-6">
            <ErrorMessage
              message={apiError}
              errors={fieldErrors}
              onDismiss={() => {
                setApiError(null);
                setFieldErrors(null);
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-[#111111] mb-2">
              I want to join as: <span className="text-[#666666]" aria-hidden="true">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Account type">
              <button
                type="button"
                role="radio"
                aria-checked={formData.role === 'CUSTOMER'}
                onClick={() => handleRoleSelect('CUSTOMER')}
                className={`p-3.5 rounded-sm border text-left transition-all duration-150 cursor-pointer ${
                  formData.role === 'CUSTOMER'
                    ? 'border-[#111111] bg-[#F7F7F7] ring-1 ring-[#111111]'
                    : 'border-[#E5E5E5] hover:border-[#666666] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#111111]">Customer</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      formData.role === 'CUSTOMER'
                        ? 'border-[#111111] bg-[#111111]'
                        : 'border-[#E5E5E5]'
                    }`}
                  >
                    {formData.role === 'CUSTOMER' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#666666]">Book and manage home &amp; local services</p>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={formData.role === 'PROVIDER'}
                onClick={() => handleRoleSelect('PROVIDER')}
                className={`p-3.5 rounded-sm border text-left transition-all duration-150 cursor-pointer ${
                  formData.role === 'PROVIDER'
                    ? 'border-[#111111] bg-[#F7F7F7] ring-1 ring-[#111111]'
                    : 'border-[#E5E5E5] hover:border-[#666666] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-[#111111]">Provider</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      formData.role === 'PROVIDER'
                        ? 'border-[#111111] bg-[#111111]'
                        : 'border-[#E5E5E5]'
                    }`}
                  >
                    {formData.role === 'PROVIDER' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#666666]">List services and receive bookings</p>
              </button>
            </div>
            {errors.role && <p className="mt-1 text-xs text-[#1F1F1F] font-medium">{errors.role}</p>}
          </div>

          <Input
            label="Full Name"
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isSubmitting}
          />

          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isSubmitting}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Min. 8 characters (A-Z, a-z, 0-9, @#$)"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText="At least 8 chars with uppercase, lowercase, number & symbol"
            disabled={isSubmitting}
          />

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Create {formData.role === 'PROVIDER' ? 'Provider' : 'Customer'} Account
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] text-center">
          <p className="text-sm text-[#666666]">
            Already have an account?{' '}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-[#111111] hover:text-black underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
