'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input, Select, Textarea } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import { useParentCategoryOptions } from '@/hooks/queries/useParentCategoryOptions';
import SkuInput from '../SkuInput';
import SlugInput from '../SlugInput';
import { useState } from 'react';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

interface ProductSummaryProps {
  className?: string;
  mode?: 'create' | 'edit';
  existingSlug?: string;
}

export default function ProductSummary({ className, mode = 'create', existingSlug }: ProductSummaryProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { data: categoryOptions = [], isLoading: categoriesLoading } = useParentCategoryOptions();
  const [slugTouched, setSlugTouched] = useState(false);
  const productName = watch('name');

  return (
    <FormGroup
      title="Summary"
      description="Edit your product name, SKU, description and necessary information from here"
      className={cn(className)}
    >
      <Input
        label="Product Name"
        placeholder="e.g., Premium Wireless Headphones"
        {...register('name', {
          onChange: (e) => {
            // Only auto-generate slug if it hasn't been manually touched
            if (!slugTouched && mode === 'create') {
              const value = e.target.value;
              const slug = value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');
              setValue('slug', slug);
            }
          },
        })}
        error={errors.name?.message as string}
      />

      <Controller
        name="sku"
        control={control}
        render={({ field }) => (
          <SkuInput
            value={field.value}
            onChange={field.onChange}
            error={errors.sku?.message as string}
            disabled={mode === 'edit'}
            currentProductId={existingSlug ? undefined : existingSlug} // Pass product ID in edit mode if needed
          />
        )}
      />

      <Controller
        name="slug"
        control={control}
        render={({ field }) => (
          <SlugInput
            value={field.value}
            onChange={field.onChange}
            onTouch={() => setSlugTouched(true)}
            error={errors.slug?.message as string}
            readOnly={mode === 'edit'}
            existingSlug={existingSlug}
          />
        )}
      />

      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select
            label="Category"
            options={categoryOptions}
            value={field.value}
            onChange={field.onChange}
            searchable
            disabled={categoriesLoading}
            placeholder="Select category..."
            error={errors.category?.message as string}
            getOptionValue={(option) => option.value}
            getOptionDisplayValue={(option) => option.label}
          />
        )}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            label="Status"
            options={statusOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.status?.message as string}
            getOptionValue={(option) => option.value}
            getOptionDisplayValue={(option) => {
              const statusColors: Record<string, string> = {
                active: 'text-green-600',
                inactive: 'text-red-600',
                archived: 'text-gray-600',
              };
              const colorClass = statusColors[option.value] || 'text-gray-600';
              return (
                <span className={cn('font-medium', colorClass)}>
                  {option.label}
                </span>
              );
            }}
          />
        )}
      />
    </FormGroup>
  );
}
