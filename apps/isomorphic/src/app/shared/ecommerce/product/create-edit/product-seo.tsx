'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';

export default function ProductSeo({ className }: { className?: string }) {
  const { register, watch, formState: { errors } } = useFormContext();

  const productName = watch('name');
  const slug = watch('slug');

  // Generate slug from product name as placeholder
  const generatedSlug = productName 
    ? productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : '';

  return (
    <FormGroup
      title="Search Engine Optimization"
      description="Configure SEO-friendly URL slug for this product"
      className={cn(className)}
    >
      <Input
        label="URL Slug"
        placeholder={generatedSlug || "enter-product-slug"}
        {...register('slug')}
        error={errors.slug?.message as string}
        prefix={<span className="text-gray-500">products/</span>}
        helperText="URL-friendly identifier for this product. Leave empty to auto-generate from product name."
      />
      <p className="text-sm text-gray-500 col-span-full">
        The slug will be automatically generated from the product name if left empty. You can also customize it manually.
      </p>
    </FormGroup>
  );
}
