'use client';

import { Controller } from 'react-hook-form';
import { Button, Input, Loader, Textarea, Select, MultiSelect } from 'rizzui';
import { PiTrash } from 'react-icons/pi';
import cn from '@core/utils/class-names';
import { Form } from '@core/ui/form';
import { productSchema, CreateProductInput } from '@/validators/product-schema';
import VeritcalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import { useParentCategoryOptions } from '@/hooks/queries/useParentCategoryOptions';
import { useState, useEffect } from 'react';
import { BackendValidationError } from '@/libs/form-errors';
import ProductImageManager from './ProductImageManager';
import SkuInput from './SkuInput';
import SlugPreview from './SlugPreview';
import ProductStatusBadge from './ProductStatusBadge';
import PackSizesManager from './PackSizesManager';

interface ProductFormProps {
  mode: 'create' | 'update';
  defaultValues?: Partial<CreateProductInput> & { _id?: string };
  onSubmit: (data: CreateProductInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
  isModalView?: boolean;
  apiErrors?: BackendValidationError[] | null;
}

const tagOptions = [
  { value: 'new-arrival', label: 'New Arrival' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'featured', label: 'Featured' },
  { value: 'sale', label: 'Sale' },
  { value: 'limited-edition', label: 'Limited Edition' },
  { value: 'trending', label: 'Trending' },
  { value: 'eco-friendly', label: 'Eco-Friendly' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

export default function ProductForm({
  mode,
  defaultValues,
  onSubmit,
  onDelete,
  isLoading = false,
  submitButtonText = 'Submit',
  isModalView = false,
  apiErrors = null,
}: ProductFormProps) {
  const { data: categoryOptions = [], isLoading: categoriesLoading } =
    useParentCategoryOptions();
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <Form<CreateProductInput>
      validationSchema={productSchema}
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onSubmit',
        defaultValues: {
          sku: defaultValues?.sku || 0,
          name: defaultValues?.name || '',
          description: defaultValues?.description || '',
          price: defaultValues?.price || 0,
          category: defaultValues?.category || '',
          tags: defaultValues?.tags || [],
          description_images: defaultValues?.description_images || [],
          specifications: defaultValues?.specifications || [],
          dimension: defaultValues?.dimension || [],
          shipping: defaultValues?.shipping || {
            addedCost: 0,
            increaseCostBy: 0,
            addedDays: 0,
          },
          attributes: defaultValues?.attributes || [],
          pricingTiers: defaultValues?.pricingTiers || [],
          packSizes: defaultValues?.packSizes || [],
          stock: defaultValues?.stock || 0,
          lowStockThreshold: defaultValues?.lowStockThreshold || 5,
          status: defaultValues?.status || 'inactive',
          slug: defaultValues?.slug,
        },
      }}
      className="flex flex-grow flex-col @container [&_label]:font-medium"
    >
      {({
        register,
        control,
        setValue,
        getValues,
        watch,
        formState: { errors, isSubmitting },
        setError,
      }) => {
        const productName = watch('name');
        const currentSlug = watch('slug');
        const descriptionImages = watch('description_images') || [];

        // Set backend errors when apiErrors changes
        useEffect(() => {
          if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach((error) => {
              if (error.path && error.msg) {
                setError(error.path as any, {
                  type: 'manual',
                  message: error.msg,
                });
              }
            });
          }
        }, [apiErrors]);

        return (
          <>
            <div className="flex-grow pb-10">
              <div className="grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12">
                {/* Product Name */}
                <VeritcalFormBlockWrapper
                  title="Product Name"
                  description="Enter the product name"
                >
                  <Input
                    {...register('name', {
                      onChange: (e) => {
                        // Auto-generate slug from name if slug hasn't been manually touched
                        if (!slugTouched && mode !== 'update') {
                          const value = e.target.value;
                          const slug = value
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w-]/g, '');
                          setValue('slug', slug);
                        }
                      },
                    })}
                    placeholder="e.g., Premium Wireless Headphones"
                    error={errors.name?.message as string}
                    className="flex-grow"
                  />
                </VeritcalFormBlockWrapper>

                {/* SKU & Slug */}
                <VeritcalFormBlockWrapper
                  title="Product Identification"
                  description="SKU and URL slug for the product"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Controller
                      name="sku"
                      control={control}
                      render={({ field }) => (
                        <SkuInput
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.sku?.message as string}
                          disabled={mode === 'update'}
                          currentProductId={defaultValues?._id}
                        />
                      )}
                    />
                    <SlugPreview
                      productName={productName}
                      currentSlug={currentSlug}
                    />
                  </div>
                </VeritcalFormBlockWrapper>

                {/* Description */}
                <VeritcalFormBlockWrapper
                  title="Description"
                  description="Detailed product description"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Textarea
                    {...register('description')}
                    placeholder="Describe your product in detail..."
                    rows={6}
                    error={errors.description?.message as string}
                    className="flex-grow"
                  />
                </VeritcalFormBlockWrapper>

                {/* Category */}
                <VeritcalFormBlockWrapper
                  title="Category"
                  description="Select product category"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        options={categoryOptions}
                        value={field.value}
                        onChange={field.onChange}
                        searchable
                        disabled={categoriesLoading}
                        placeholder="Select category..."
                        error={errors.category?.message as string}
                        getOptionValue={(option) => option.value}
                      />
                    )}
                  />
                </VeritcalFormBlockWrapper>

                {/* Pricing & Stock */}
                <VeritcalFormBlockWrapper
                  title="Pricing & Stock"
                  description="Set price and stock levels"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      type="number"
                      label="Price"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      {...register('price', { valueAsNumber: true })}
                      error={errors.price?.message as string}
                    />
                    <Input
                      type="number"
                      label="Stock Quantity"
                      placeholder="0"
                      min="0"
                      {...register('stock', { valueAsNumber: true })}
                      error={errors.stock?.message as string}
                    />
                    <Input
                      type="number"
                      label="Low Stock Threshold"
                      placeholder="5"
                      min="0"
                      {...register('lowStockThreshold', {
                        valueAsNumber: true,
                      })}
                      error={errors.lowStockThreshold?.message as string}
                    />
                  </div>
                </VeritcalFormBlockWrapper>

                {/* Status & Tags */}
                <VeritcalFormBlockWrapper
                  title="Status & Tags"
                  description="Set product status and tags"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        />
                      )}
                    />
                    <Controller
                      name="tags"
                      control={control}
                      render={({ field }) => (
                        <MultiSelect
                          label="Tags"
                          options={tagOptions}
                          value={field.value || []}
                          onChange={field.onChange}
                          searchable
                          clearable
                          placeholder="Select tags..."
                          error={errors.tags?.message as string}
                          getOptionValueKey="value"
                        />
                      )}
                    />
                  </div>
                </VeritcalFormBlockWrapper>

                {/* Product Images */}
                <VeritcalFormBlockWrapper
                  title="Product Images"
                  description="Upload product images (mark one as cover)"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Controller
                    name="description_images"
                    control={control}
                    render={({ field }) => (
                      <ProductImageManager
                        images={field.value}
                        getValues={getValues}
                        setValue={setValue}
                        onChange={field.onChange}
                        error={errors.description_images?.message as string}
                      />
                    )}
                  />
                </VeritcalFormBlockWrapper>

                {/* Shipping Info */}
                <VeritcalFormBlockWrapper
                  title="Shipping Information"
                  description="Additional shipping costs and delivery time"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                      type="number"
                      label="Added Cost"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      {...register('shipping.addedCost', {
                        valueAsNumber: true,
                      })}
                      error={errors.shipping?.addedCost?.message as string}
                    />
                    <Input
                      type="number"
                      label="Increase Cost By (%)"
                      placeholder="0"
                      step="0.01"
                      min="0"
                      {...register('shipping.increaseCostBy', {
                        valueAsNumber: true,
                      })}
                      error={errors.shipping?.increaseCostBy?.message as string}
                    />
                    <Input
                      type="number"
                      label="Added Days"
                      placeholder="0"
                      min="0"
                      {...register('shipping.addedDays', {
                        valueAsNumber: true,
                      })}
                      error={errors.shipping?.addedDays?.message as string}
                    />
                  </div>
                </VeritcalFormBlockWrapper>

                {/* Specifications */}
                <VeritcalFormBlockWrapper
                  title="Specifications"
                  description="Add product specifications (e.g., Material, Color, Size)"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <div className="space-y-4">
                    {(watch('specifications') || []).map((spec, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        <Input
                          label="Specification Name"
                          placeholder="e.g., Material"
                          {...register(`specifications.${index}.key`)}
                          error={
                            errors.specifications?.[index]?.key
                              ?.message as string
                          }
                        />
                        <div className="flex gap-2">
                          <Input
                            label="Value"
                            placeholder="e.g., Plastic"
                            {...register(`specifications.${index}.value`)}
                            error={
                              errors.specifications?.[index]?.value
                                ?.message as string
                            }
                            className="flex-grow"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            color="danger"
                            className="mt-6"
                            onClick={() => {
                              const specs = getValues('specifications') || [];
                              setValue(
                                'specifications',
                                specs.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <PiTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const specs = getValues('specifications') || [];
                        setValue('specifications', [
                          ...specs,
                          { key: '', value: '' },
                        ]);
                      }}
                    >
                      + Add Specification
                    </Button>
                  </div>
                </VeritcalFormBlockWrapper>

                {/* Dimensions */}
                <VeritcalFormBlockWrapper
                  title="Dimensions"
                  description="Add product dimensions"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <div className="space-y-4">
                    {(watch('dimension') || []).map((dim, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        <Controller
                          name={`dimension.${index}.key`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Dimension Type"
                              options={[
                                { value: 'length', label: 'Length' },
                                { value: 'breadth', label: 'Breadth' },
                                { value: 'height', label: 'Height' },
                                { value: 'volume', label: 'Volume' },
                                { value: 'width', label: 'Width' },
                                { value: 'weight', label: 'Weight' },
                              ]}
                              value={field.value}
                              onChange={field.onChange}
                              error={
                                errors.dimension?.[index]?.key
                                  ?.message as string
                              }
                            />
                          )}
                        />
                        <div className="flex gap-2">
                          <Input
                            label="Value"
                            placeholder="e.g., 10cm"
                            {...register(`dimension.${index}.value`)}
                            error={
                              errors.dimension?.[index]?.value
                                ?.message as string
                            }
                            className="flex-grow"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            color="danger"
                            className="mt-6"
                            onClick={() => {
                              const dims = getValues('dimension') || [];
                              setValue(
                                'dimension',
                                dims.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            <PiTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const dims = getValues('dimension') || [];
                        setValue('dimension', [
                          ...dims,
                          { key: 'length' as const, value: '' },
                        ]);
                      }}
                    >
                      + Add Dimension
                    </Button>
                  </div>
                </VeritcalFormBlockWrapper>

                {/* Pricing Tiers */}
                <VeritcalFormBlockWrapper
                  title="Pricing Tiers"
                  description="Set bulk pricing based on quantity"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <div className="space-y-4">
                    {(watch('pricingTiers') || []).map((tier, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-5"
                      >
                        <Input
                          type="number"
                          label="Min Quantity"
                          placeholder="1"
                          min="1"
                          {...register(`pricingTiers.${index}.minQty`, {
                            valueAsNumber: true,
                          })}
                          error={
                            errors.pricingTiers?.[index]?.minQty
                              ?.message as string
                          }
                        />
                        <Input
                          type="number"
                          label="Max Quantity (Optional)"
                          placeholder="10"
                          min="1"
                          {...register(`pricingTiers.${index}.maxQty`, {
                            valueAsNumber: true,
                          })}
                          error={
                            errors.pricingTiers?.[index]?.maxQty
                              ?.message as string
                          }
                        />
                        <Controller
                          name={`pricingTiers.${index}.strategy`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              label="Strategy"
                              options={[
                                { value: 'fixedPrice', label: 'Fixed Price' },
                                { value: 'percentOff', label: 'Percent Off' },
                                { value: 'amountOff', label: 'Amount Off' },
                              ]}
                              value={field.value}
                              onChange={field.onChange}
                              error={
                                errors.pricingTiers?.[index]?.strategy
                                  ?.message as string
                              }
                            />
                          )}
                        />
                        <Input
                          type="number"
                          label="Value"
                          placeholder="0"
                          step="0.01"
                          min="0"
                          {...register(`pricingTiers.${index}.value`, {
                            valueAsNumber: true,
                          })}
                          error={
                            errors.pricingTiers?.[index]?.value
                              ?.message as string
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          color="danger"
                          className="mt-6"
                          onClick={() => {
                            const tiers = getValues('pricingTiers') || [];
                            setValue(
                              'pricingTiers',
                              tiers.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <PiTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const tiers = getValues('pricingTiers') || [];
                        setValue('pricingTiers', [
                          ...tiers,
                          {
                            minQty: 1,
                            strategy: 'fixedPrice' as const,
                            value: 0,
                          },
                        ]);
                      }}
                    >
                      + Add Pricing Tier
                    </Button>
                  </div>
                </VeritcalFormBlockWrapper>

                {/* Pack Sizes */}
                <VeritcalFormBlockWrapper
                  title="Pack Sizes"
                  description="Configure how this product can be purchased in different quantities"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <PackSizesManager
                    form={{
                      register,
                      control,
                      setValue,
                      getValues,
                      watch,
                      formState: { errors },
                    } as any}
                  />
                </VeritcalFormBlockWrapper>
              </div>
            </div>

            <div
              className={cn(
                'sticky bottom-0 z-40 flex items-center justify-end gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col',
                isModalView
                  ? '-mx-10 -mb-7 px-10 py-5'
                  : 'border-t border-gray-200 py-5'
              )}
            >
              {onDelete && mode === 'update' && (
                <Button
                  type="button"
                  variant="flat"
                  color="danger"
                  onClick={onDelete}
                  disabled={isLoading || isSubmitting}
                  className="w-auto"
                >
                  Delete Product
                </Button>
              )}
              <Button
                loader={<Loader variant="spinner" size="lg" />}
                type="submit"
                isLoading={isLoading || isSubmitting}
                className="w-full @xl:w-auto"
                disabled={isLoading || isSubmitting}
              >
                {submitButtonText}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
