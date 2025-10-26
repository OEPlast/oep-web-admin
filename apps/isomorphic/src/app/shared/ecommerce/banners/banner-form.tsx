'use client';

import { Controller } from 'react-hook-form';
import { Button, Input, Loader, Select, Switch } from 'rizzui';
import cn from '@core/utils/class-names';
import { Form } from '@core/ui/form';
import {
  createBannerFormSchema,
  updateBannerFormSchema,
  CreateBannerFormInput,
  UpdateBannerFormInput,
} from '@/validators/create-banner.schema';
import HorizontalFormBlockWrapper from '@/app/shared/HorizontalFormBlockWrapper';
import { BannerImageBlock } from './BannerInfoBlock';

const categoryOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
];

type BannerFormInput = CreateBannerFormInput | UpdateBannerFormInput;

interface BannerFormProps {
  mode: 'create' | 'update';
  defaultValues?: Partial<BannerFormInput>;
  onSubmit: (data: BannerFormInput) => void;
  onDelete?: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
  isModalView?: boolean;
}

export default function BannerForm({
  mode,
  defaultValues,
  onSubmit,
  onDelete,
  isLoading = false,
  submitButtonText = 'Submit',
  isModalView = true,
}: BannerFormProps) {
  const formDefaultValues: BannerFormInput = {
    name: '',
    imageUrl: '',
    pageLink: '',
    active: false,
    category: 'A',
    ...defaultValues,
  };

  const validationSchema = mode === 'create' ? createBannerFormSchema : updateBannerFormSchema;

  return (
    <Form<BannerFormInput>
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onSubmit',
        defaultValues: formDefaultValues,
      }}
      className="isomorphic-form flex flex-col gap-6"
    >
      {({
        register,
        control,
        formState: { errors, isSubmitting },
        getValues,
        setValue,
        watch,
      }) => {
        const imageUrl = watch('imageUrl');
        
        return (
          <>
            <div className="flex-grow pb-1">
              <div
                className={cn(
                  'grid grid-cols-1',
                  isModalView
                    ? 'grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12 [&>div]:pt-7 first:[&>div]:pt-0 @2xl:[&>div]:pt-9 @3xl:[&>div]:pt-11'
                    : 'gap-5'
                )}
              >
                <HorizontalFormBlockWrapper
                  subClassName="grid-cols-1"
                  title={'Banner Information'}
                  description={'Edit your banner information from here'}
                  isModalView={isModalView}
                >
                  <Input
                    label="Banner Name"
                    placeholder="banner name"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Page Link"
                    placeholder="/page-link"
                    {...register('pageLink')}
                    error={errors.pageLink?.message}
                  />
                  <Controller
                    name="category"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        dropdownClassName="!z-[9999]"
                        options={categoryOptions}
                        onChange={onChange}
                        inPortal={false}
                        value={value}
                        label="Category"
                        error={errors?.category?.message as string}
                        getOptionValue={(option) => option.label}
                      />
                    )}
                  />
                  {mode === 'update' && (
                    <Controller
                      name="active"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-1 items-center gap-2">
                          <label className="block font-medium">
                            Active State
                          </label>
                          <Switch
                            checked={field.value}
                            onChange={(checked) => {
                              field.onChange(checked);
                            }}
                          />
                        </div>
                      )}
                    />
                  )}
                </HorizontalFormBlockWrapper>
                <BannerImageBlock
                  error={errors?.imageUrl?.message}
                  imageUrl={imageUrl}
                  setValue={setValue}
                  getValues={getValues}
                />
              </div>
            </div>

            <div
              className={cn(
                'sticky bottom-0 z-40 flex items-center gap-3 bg-gray-0/10 backdrop-blur @lg:gap-4 @xl:grid @xl:auto-cols-max @xl:grid-flow-col',
                isModalView ? '-mx-10 -mb-7 px-10 py-1' : 'py-1',
                onDelete ? 'flex-col' : ''
              )}
            >
              <Button
                loader={<Loader variant="spinner" size="lg" />}
                type="submit"
                isLoading={isLoading || isSubmitting}
                className="w-full @xl:w-auto"
                disabled={isLoading || isSubmitting}
              >
                {submitButtonText}
              </Button>
              {onDelete && mode === 'update' && (
                <Button
                  type="button"
                  variant="flat"
                  color="danger"
                  onClick={onDelete}
                  disabled={isLoading || isSubmitting}
                  className="w-full"
                >
                  Delete Banner
                </Button>
              )}
            </div>
          </>
        );
      }}
    </Form>
  );
}
