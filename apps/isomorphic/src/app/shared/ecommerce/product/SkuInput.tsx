'use client';

import { useEffect, useState } from 'react';
import { Input } from 'rizzui';
import { useCheckSku } from '@/hooks/queries/useProducts';
import { useDebounce } from '@/hooks/use-debounce';
import { PiCheckCircle, PiWarningCircle } from 'react-icons/pi';

interface SkuInputProps {
  value: string | number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  currentProductId?: string; // For edit mode
  label?: string;
  placeholder?: string;
}

export default function SkuInput({ 
  value, 
  onChange, 
  error, 
  disabled,
  currentProductId,
  label = 'SKU',
  placeholder = 'Enter product SKU'
}: SkuInputProps) {
  const [skuInput, setSkuInput] = useState(String(value || ''));
  const debouncedSku = useDebounce(skuInput, 500);
  
  const { data: skuCheck, isLoading, isError, error: queryError } = useCheckSku(
    debouncedSku,
    !disabled && !!debouncedSku && debouncedSku !== String(value)
  );

  useEffect(() => {
    setSkuInput(String(value || ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSkuInput(newValue);
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue);
    }
  };

  const skuExists = skuCheck?.exists && skuCheck.productId !== currentProductId;
  const showCheckIndicator = !disabled && debouncedSku && !isLoading && !isError;

  // Determine error message
  let errorMessage = error;
  if (isError && debouncedSku) {
    errorMessage = 'Failed to verify SKU availability. Please try again.';
  } else if (skuExists) {
    errorMessage = `SKU already exists in ${skuCheck.productName}`;
  }

  return (
    <div className="relative">
      <Input
        type="number"
        label={label}
        placeholder={placeholder}
        value={skuInput}
        onChange={handleChange}
        error={errorMessage}
        disabled={disabled}
        suffix={
          isLoading && debouncedSku ? (
            <div className="flex items-center">
              <svg className="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : isError && debouncedSku ? (
            <PiWarningCircle className="h-5 w-5 text-orange-500" title="Error checking SKU" />
          ) : showCheckIndicator ? (
            skuExists ? (
              <PiWarningCircle className="h-5 w-5 text-red-500" title="SKU already exists" />
            ) : (
              <PiCheckCircle className="h-5 w-5 text-green-500" title="SKU available" />
            )
          ) : null
        }
      />
    </div>
  );
}
