'use client';

import { Input } from 'rizzui';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

interface SlugInputProps {
  value?: string;
  onChange: (value: string) => void;
  onTouch?: () => void;
  error?: string;
  readOnly?: boolean;
  existingSlug?: string;
  label?: string;
  placeholder?: string;
}

export default function SlugInput({ 
  value = '',
  onChange,
  onTouch,
  error,
  readOnly = false,
  existingSlug,
  label = 'URL Slug',
  placeholder = 'enter-product-slug'
}: SlugInputProps) {
  const [slugInput, setSlugInput] = useState(String(value || ''));
  const debouncedSlug = useDebounce(slugInput, 500);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);

  // Update local state when value prop changes
  useEffect(() => {
    setSlugInput(String(value || ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSlugInput(newValue);
    onChange(newValue);
    if (onTouch) onTouch();
  };

  // Check slug availability when debounced value changes
  useEffect(() => {
    const checkSlugAvailability = async () => {
      // Skip if empty or same as existing slug (edit mode)
      if (!debouncedSlug || debouncedSlug === existingSlug) {
        setSlugAvailable(null);
        setHasError(false);
        return;
      }

      setIsCheckingSlug(true);
      setHasError(false);
      try {
        const response = await apiClient.get<{ available: boolean }>(
          `${api.products.checkSlug}?slug=${encodeURIComponent(debouncedSlug)}`
        );
        setSlugAvailable(response.data?.available ?? false);
      } catch (error) {
        console.error('Error checking slug:', error);
        setSlugAvailable(null);
        setHasError(true);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    checkSlugAvailability();
  }, [debouncedSlug, existingSlug]);

  // Determine validation state
  const isAvailable = slugAvailable === true;
  const isUnavailable = slugAvailable === false;
  const showValidation = debouncedSlug && debouncedSlug !== existingSlug;

  // Determine error message
  let errorMessage = error;
  if (hasError && debouncedSlug) {
    errorMessage = 'Failed to verify slug availability. Please try again.';
  } else if (isUnavailable) {
    errorMessage = 'This slug is already taken';
  }

  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={slugInput}
      onChange={handleChange}
      readOnly={readOnly}
      disabled={readOnly}
      error={errorMessage}
      prefix={<span className="text-gray-500">products/</span>}
      suffix={
        isCheckingSlug ? (
          <div className="flex items-center">
            <svg className="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : hasError && showValidation ? (
          <span className="text-orange-500" title="Error checking slug">⚠</span>
        ) : showValidation ? (
          isAvailable ? (
            <span className="text-green-500" title="Slug available">✓</span>
          ) : (
            <span className="text-red-500" title="Slug already taken">✗</span>
          )
        ) : null
      }
      helperText={
        readOnly 
          ? 'Slug cannot be changed after product creation'
          : 'URL-friendly identifier for this product'
      }
    />
  );
}
