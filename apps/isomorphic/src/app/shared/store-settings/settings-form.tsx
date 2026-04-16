'use client';

import { useState, useEffect } from 'react';
import { Form } from '@core/ui/form';
import { useStoreSettings } from '@/hooks/queries/useStoreSettings';
import { useUpdateStoreSettings } from '@/hooks/mutations/useUpdateStoreSettings';
import {
  BackendValidationError,
  extractBackendErrors,
  setBackendFormErrors,
} from '@/libs/form-errors';
import {
  updateStoreSettingsSchema,
  UpdateStoreSettingsInput,
} from '@/validators/update-store-settings.schema';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Button, Input, Textarea, Loader } from 'rizzui';
import { Controller } from 'react-hook-form';
import cn from '@core/utils/class-names';
import UploadZone from '@core/ui/file-upload/upload-zone';
import { getCdnUrl } from '@core/utils/cdn-url';
import Image from 'next/image';
import { PiXBold } from 'react-icons/pi';
import CheckoutDeliverySettingsCard from './checkout-delivery-settings-card';

export default function SettingsForm() {
  const { data: settings, isLoading } = useStoreSettings();
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(
    null
  );

  const updateMutation = useUpdateStoreSettings({
    onSuccess: () => {
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error.response.data);
        if (backendErrors) {
          setApiErrors(backendErrors);
        } else {
          const backendMessage = error.response.data?.message;
          toast.error(backendMessage || 'Something went wrong, try again');
        }
      } else {
        toast.error('Something went wrong, try again');
      }
    },
  });

  const onSubmit = (data: UpdateStoreSettingsInput) => {
    setApiErrors(null);
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <Form<UpdateStoreSettingsInput>
      validationSchema={updateStoreSettingsSchema}
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onBlur',
        defaultValues: {
          storeName: settings?.storeName || '',
          companyName: settings?.companyName || '',
          logoUrl: settings?.logoUrl || '',
          websiteUrl: settings?.websiteUrl || '',
          supportEmail: settings?.supportEmail || '',
          supportPhone: settings?.supportPhone || '',
          address: {
            line1: settings?.address?.line1 || '',
            line2: settings?.address?.line2 || '',
            city: settings?.address?.city || '',
            state: settings?.address?.state || '',
            zip: settings?.address?.zip || '',
            country: settings?.address?.country || '',
          },
          taxId: settings?.taxId || '',
          taxRate: settings?.taxRate || 0,
          currency: settings?.currency || 'USD',
        },
      }}
      className="isomorphic-form flex max-w-[900px] flex-col gap-6"
    >
      {({
        register,
        control,
        watch,
        formState: { errors },
        setValue,
        setError,
        getValues,
      }) => {
        // Set backend errors when apiErrors changes
        if (apiErrors) {
          setBackendFormErrors(apiErrors, setError);
          setApiErrors(null);
        }

        const logoValue = watch('logoUrl');

        return (
          <>
            {/* Logo Upload Section */}
            <div className={cn('rounded-lg border border-muted p-6')}>
              <h3 className="mb-4 text-lg font-semibold">Store Logo</h3>

              {!logoValue ? (
                <Controller
                  name="logoUrl"
                  control={control}
                  render={({ field }) => (
                    <UploadZone
                      name="logoUrl"
                      getValues={getValues}
                      setValue={setValue}
                      label="Upload Store Logo"
                      category="settings"
                      multiple={false}
                      accept="image/*"
                      error={errors.logoUrl?.message}
                    />
                  )}
                />
              ) : (
                <div className="relative h-[200px] w-full rounded-lg border">
                  <Image
                    fill
                    src={getCdnUrl(logoValue)}
                    alt="Store Logo"
                    className="rounded-lg object-contain p-4"
                  />
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="absolute right-2 top-2"
                    onClick={() => setValue('logoUrl', '')}
                  >
                    <PiXBold className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className={cn('rounded-lg border border-muted p-6')}>
              <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
              <div className="grid gap-4 @md:grid-cols-2">
                <Input
                  label="Store Name"
                  placeholder="Enter store name"
                  {...register('storeName')}
                  error={errors.storeName?.message}
                />
                <Input
                  label="Company Name"
                  placeholder="Enter company name"
                  {...register('companyName')}
                  error={errors.companyName?.message}
                />
                <Input
                  label="Website URL"
                  placeholder="https://example.com"
                  {...register('websiteUrl')}
                  error={errors.websiteUrl?.message}
                />
                <Input
                  label="Currency"
                  placeholder="USD"
                  {...register('currency')}
                  error={errors.currency?.message}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className={cn('rounded-lg border border-muted p-6')}>
              <h3 className="mb-4 text-lg font-semibold">
                Contact Information
              </h3>
              <div className="grid gap-4 @md:grid-cols-2">
                <Input
                  label="Support Email"
                  type="email"
                  placeholder="support@example.com"
                  {...register('supportEmail')}
                  error={errors.supportEmail?.message}
                />
                <Input
                  label="Support Phone"
                  placeholder="+1 (555) 123-4567"
                  {...register('supportPhone')}
                  error={errors.supportPhone?.message}
                />
              </div>
            </div>

            {/* Address */}
            <div className={cn('rounded-lg border border-muted p-6')}>
              <h3 className="mb-4 text-lg font-semibold">Address</h3>
              <div className="grid gap-4">
                <Input
                  label="Address Line 1"
                  placeholder="Street address"
                  {...register('address.line1')}
                  error={errors.address?.line1?.message}
                />
                <Input
                  label="Address Line 2 (Optional)"
                  placeholder="Apartment, suite, etc."
                  {...register('address.line2')}
                  error={errors.address?.line2?.message}
                />
                <div className="grid gap-4 @md:grid-cols-3">
                  <Input
                    label="City"
                    placeholder="City"
                    {...register('address.city')}
                    error={errors.address?.city?.message}
                  />
                  <Input
                    label="State/Province"
                    placeholder="State"
                    {...register('address.state')}
                    error={errors.address?.state?.message}
                  />
                  <Input
                    label="ZIP/Postal Code"
                    placeholder="ZIP code"
                    {...register('address.zip')}
                    error={errors.address?.zip?.message}
                  />
                </div>
                <Input
                  label="Country"
                  placeholder="Country"
                  {...register('address.country')}
                  error={errors.address?.country?.message}
                />
              </div>
            </div>

            {/* Tax Information */}
            <div className={cn('rounded-lg border border-muted p-6')}>
              <h3 className="mb-4 text-lg font-semibold">Tax Information</h3>
              <div className="grid gap-4 @md:grid-cols-2">
                <Input
                  label="Tax ID"
                  placeholder="Enter tax ID"
                  {...register('taxId')}
                  error={errors.taxId?.message}
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="0.00"
                  {...register('taxRate', { valueAsNumber: true })}
                  error={errors.taxRate?.message}
                />
              </div>
            </div>

            <CheckoutDeliverySettingsCard />

            {/* Submit Button */}
            <div className="flex gap-3 border-t pt-6">
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                className="w-full @xl:w-auto"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
