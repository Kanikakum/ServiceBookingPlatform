'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { providerApi } from '../../lib/providerApi';
import { ROUTES } from '../../utils/routes';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ServiceForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    categoryId: initialData?.categoryId?.toString() || initialData?.category?.id?.toString() || '',
    description: initialData?.description || '',
    price: initialData?.price !== undefined ? initialData.price.toString() : '',
    durationMinutes: initialData?.durationMinutes !== undefined ? initialData.durationMinutes.toString() : '60',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const catList = await providerApi.getCategories();
        if (isMounted && Array.isArray(catList)) {
          setCategories(catList);
          // If creating and no category chosen yet, default to first category
          if (!isEdit && catList.length > 0) {
            setFormData((prev) => (prev.categoryId ? prev : { ...prev, categoryId: catList[0].id.toString() }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, [isEdit]);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = 'Service title is required';
    } else if (formData.title.trim().length < 3) {
      nextErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 100) {
      nextErrors.title = 'Title must not exceed 100 characters';
    }

    if (!formData.categoryId) {
      nextErrors.categoryId = 'Please select a service category';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Service description is required';
    } else if (formData.description.trim().length < 10) {
      nextErrors.description = 'Description must be at least 10 characters long';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      nextErrors.price = 'Price must be a valid positive number';
    }

    const durationNum = parseInt(formData.durationMinutes, 10);
    if (!formData.durationMinutes || isNaN(durationNum) || durationNum <= 0) {
      nextErrors.durationMinutes = 'Duration must be a positive integer in minutes';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setFieldErrors(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      categoryId: parseInt(formData.categoryId, 10),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      durationMinutes: parseInt(formData.durationMinutes, 10),
    };

    try {
      if (isEdit && initialData?.id) {
        await providerApi.updateService(initialData.id, payload);
      } else {
        await providerApi.createService(payload);
      }

      router.push('/provider/services');
    } catch (err) {
      setApiError(err.message || 'Failed to save service. Please check your inputs.');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <LoadingSpinner size="md" label="Loading form configuration..." />
        <p className="mt-3 text-xs text-gray-500 font-medium">Preparing service editor...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 sm:p-8 rounded-sm border border-[#E5E5E5]">
      {apiError && (
        <ErrorMessage
          message={apiError}
          errors={fieldErrors}
          onDismiss={() => {
            setApiError(null);
            setFieldErrors(null);
          }}
        />
      )}

      {/* Service Title */}
      <Input
        label="Service Title"
        id="title"
        name="title"
        type="text"
        required
        placeholder="e.g. Deluxe Deep Apartment Cleaning"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        disabled={isSubmitting}
        helperText="A clear, descriptive name for your service (3-100 chars)"
      />

      {/* Category Dropdown */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-[#111111] mb-1.5">
          Service Category <span className="text-[#666666]" aria-hidden="true">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`block w-full rounded-sm border px-3.5 py-2.5 text-sm text-[#111111] bg-white focus:outline-none focus-visible:ring-1 disabled:bg-[#F7F7F7] disabled:text-[#666666] transition-colors ${
            errors.categoryId
              ? 'border-[#1F1F1F] focus-visible:ring-black'
              : 'border-[#E5E5E5] hover:border-[#666666] focus-visible:ring-black focus-visible:border-[#111111]'
          }`}
        >
          <option value="" disabled>
            Select a Category
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1.5 text-xs text-[#1F1F1F] font-medium">{errors.categoryId}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[#111111] mb-1.5">
          Service Description <span className="text-[#666666]" aria-hidden="true">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          placeholder="Explain what is included in this service, equipment used, customer preparations..."
          value={formData.description}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`block w-full rounded-sm border px-3.5 py-2.5 text-sm text-[#111111] bg-white focus:outline-none focus-visible:ring-1 disabled:bg-[#F7F7F7] disabled:text-[#666666] transition-colors placeholder-[#666666] ${
            errors.description
              ? 'border-[#1F1F1F] focus-visible:ring-black'
              : 'border-[#E5E5E5] hover:border-[#666666] focus-visible:ring-black focus-visible:border-[#111111]'
          }`}
        />
        {errors.description && <p className="mt-1.5 text-xs text-[#1F1F1F] font-medium">{errors.description}</p>}
        <p className="mt-1 text-xs text-[#666666]">Min 10 characters.</p>
      </div>

      {/* Pricing & Duration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Price (₹)"
          id="price"
          name="price"
          type="number"
          min="0"
          step="1"
          required
          placeholder="e.g. 1500"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          disabled={isSubmitting}
          helperText="Standard rate per appointment"
        />

        <Input
          label="Estimated Duration (Minutes)"
          id="durationMinutes"
          name="durationMinutes"
          type="number"
          min="15"
          step="15"
          required
          placeholder="e.g. 60"
          value={formData.durationMinutes}
          onChange={handleChange}
          error={errors.durationMinutes}
          disabled={isSubmitting}
          helperText="e.g. 60 (1 hr), 120 (2 hrs)"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end space-x-3">
        <Link href="/provider/services">
          <Button variant="outline" size="md" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="font-semibold shadow-xs"
        >
          {isEdit ? 'Save Changes' : 'Publish Service'}
        </Button>
      </div>
    </form>
  );
}
