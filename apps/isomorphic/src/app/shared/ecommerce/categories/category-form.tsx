'use client';

import { Controller, ControllerRenderProps } from 'react-hook-form';
import { Button, Input, Loader, Textarea, Select, MultiSelect, ActionIcon, Switch } from 'rizzui';
import cn from '@core/utils/class-names';
import { Form } from '@core/ui/form';
import {
  createCategoryFormSchema,
  updateCategoryFormSchema,
  CreateCategoryFormInput,
  UpdateCategoryFormInput,
} from '@/validators/create-category.schema';
import VeritcalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import { useParentCategoryOptions } from '@/hooks/queries/useParentCategoryOptions';
import { useState, useEffect } from 'react';
import { BackendValidationError } from '@/libs/form-errors';
import UploadZone from '@core/ui/file-upload/upload-zone';
import { PiTrashBold } from 'react-icons/pi';
import { getCdnUrl } from '@core/utils/cdn-url';
type CategoryFormInput = CreateCategoryFormInput | UpdateCategoryFormInput;

interface CategoryFormProps {
  mode: 'create' | 'update';
  defaultValues?: Partial<UpdateCategoryFormInput>; // Use UpdateCategoryFormInput for broader type support
  onSubmit: (data: CategoryFormInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
  isModalView?: boolean;
  apiErrors?: BackendValidationError[] | null;
}

export default function CategoryForm({
  mode,
  defaultValues,
  onSubmit,
  onDelete,
  isLoading = false,
  submitButtonText = 'Submit',
  isModalView = true,
  apiErrors = null,
}: CategoryFormProps) {
  const { data: parentOptions = [], isLoading: categoriesLoading } = useParentCategoryOptions(
    mode === 'update' ? defaultValues?._id : undefined
  );
  const [imagePreview, setImagePreview] = useState(defaultValues?.image || '');
  const [bannerPreview, setBannerPreview] = useState(defaultValues?.banner || '');
  const [slugTouched, setSlugTouched] = useState(false);

  
  // Get validation schema based on mode
  const validationSchema = mode === 'create' ? createCategoryFormSchema : updateCategoryFormSchema;

  return (
    <Form<any>
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onSubmit',
        defaultValues: {
          slug: defaultValues?.slug,
          name: defaultValues?.name,
          description: defaultValues?.description,
          image: defaultValues?.image,
          banner: defaultValues?.banner,
          parent: defaultValues?.parent || [],
          priority: defaultValues?.priority ?? false,
        },
      }}
      className="flex flex-grow flex-col @container [&_label]:font-medium"
    >
      {({ register, control, setValue, getValues, formState: { errors, isSubmitting }, setError }) => {
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
        }, [apiErrors, setError]);

        return (
          <>
            <div className="flex-grow pb-10">
              <div className="grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12">
                {/* Category Name */}
                <VeritcalFormBlockWrapper
                  title="Category Name"
                  description="Enter the category name (2-32 characters)"
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
                    placeholder="e.g., Electronics, Clothing"
                    error={errors.name?.message as string}
                    className="flex-grow"
                  />
                </VeritcalFormBlockWrapper>

                {/* Slug */}
                <VeritcalFormBlockWrapper
                  title="Slug"
                  description="URL-friendly version of the name (auto-generated)"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Input
                    {...register('slug', {
                      onChange: (e) => {
                        // Mark slug as manually touched to stop auto-generation
                        setSlugTouched(true);
                        setValue('slug', e.target.value);
                      },
                    })}
                    placeholder="e.g., electronics, clothing"
                    error={errors.slug?.message as string}
                    className="flex-grow"
                  />
                </VeritcalFormBlockWrapper>

                {/* Description */}
                <VeritcalFormBlockWrapper
                  title="Description"
                  description="Optional description for the category"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Textarea
                    {...register('description')}
                    placeholder="Describe this category..."
                    rows={4}
                    error={errors.description?.message as string}
                    className="flex-grow"
                  />
                </VeritcalFormBlockWrapper>

                {/* Parent Categories */}
                <VeritcalFormBlockWrapper
                  title="Parent Categories"
                  description="Select parent categories (optional, supports multiple)"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11 relative"
                >
                  <Controller
                    name="parent"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <MultiSelect
                        options={parentOptions}
                        value={value}
                        onChange={onChange}
                        searchable
                       hideSelectedOptions={false}
                        disabled={categoriesLoading}
                        placeholder="Select parent categories..."
                        error={errors.parent?.message as string}
                        inPortal={false}
                      />
                    )}
                  />
                </VeritcalFormBlockWrapper>

                {/* Priority */}
                <VeritcalFormBlockWrapper
                  title="Priority Category"
                  description="Mark this category as a priority category to display it prominently"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={value}
                          onChange={onChange}
                        />
                        <span className="text-sm text-gray-600">
                          {value ? 'Priority category enabled' : 'Priority category disabled'}
                        </span>
                      </div>
                    )}
                  />
                </VeritcalFormBlockWrapper>

                {/* Image Upload */}
                <VeritcalFormBlockWrapper
                  title="Category Image"
                  description="Upload category image"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Controller
                    name="image"
                    control={control}
                    render={({field}) => (
                      <div className="flex flex-col gap-4">
                        {field.value ? (
                          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                            <img
                              src={getCdnUrl(field.value)}
                              alt="Category preview"
                              className="h-full w-full object-contain"
                              onError={() => field.onChange('')}
                            />
                            <ActionIcon
                              size="sm"
                              variant="flat"
                              color="danger"
                              className="absolute top-2 right-2 cursor-pointer"
                              onClick={() => field.onChange('')}
                            >
                              <PiTrashBold className="h-4 w-4" />
                            </ActionIcon>
                          </div>
                        ) : (
                          <UploadZone
                            multiple={false}
                            name='image'
                            getValues={getValues}
                            setValue={setValue}
                            className="min-h-[180px] border-dashed"
                          />
                        )}
                        {errors.image && (
                          <p className="text-sm text-red-600">{errors.image?.message as string}</p>
                        )}
                      </div>
                    )}
                  />
                </VeritcalFormBlockWrapper>

                {/* Banner Upload */}
                <VeritcalFormBlockWrapper
                  title="Category Banner"
                  description="Upload category banner (wide format recommended)"
                  className="pt-7 @2xl:pt-9 @3xl:pt-11"
                >
                  <Controller
                    name="banner"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <div className="flex flex-col gap-4">
                        {value ? (
                          <div className="relative aspect-[3/1] w-full max-w-2xl overflow-hidden rounded-lg border">
                            <img
                              src={getCdnUrl(value)}
                              alt="Banner preview"
                              className="h-full w-full object-contain"
                              onError={() => onChange('')}
                            />
                            <ActionIcon
                              size="sm"
                              variant="flat"
                              color="danger"
                              className="absolute top-2 right-2 cursor-pointer"
                              onClick={() => onChange('')}
                            >
                              <PiTrashBold className="h-4 w-4" />
                            </ActionIcon>
                          </div>
                        ) : (
                          <UploadZone
                            multiple={false}
                            name='banner'
                            getValues={getValues}
                            setValue={setValue}
                            className="min-h-[180px] border-dashed"
                          />
                        )}
                        {errors.banner && (
                          <p className="text-sm text-red-600">{errors.banner?.message as string}</p>
                        )}
                      </div>
                    )}
                  />
                </VeritcalFormBlockWrapper>
              </div>
            </div>

            <div
              className={cn(
                'sticky bottom-0 z-40 flex items-center gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col justify-end',
                isModalView ? '-mx-10 -mb-7 px-10 py-1' : 'py-1',
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
                  Delete Category
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
