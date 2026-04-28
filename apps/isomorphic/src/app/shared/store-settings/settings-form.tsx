'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Element } from 'react-scroll';
import { Input, Loader } from 'rizzui';
import { Button } from 'rizzui';
import { PiXBold, PiInstagramLogoBold, PiFacebookLogoBold, PiWhatsappLogoBold, PiThreadsLogoBold } from 'react-icons/pi';
import { RiTwitterXLine } from 'react-icons/ri';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';

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
import UploadZone from '@core/ui/file-upload/upload-zone';
import { getCdnUrl } from '@core/utils/cdn-url';
import FormFooter from '@core/components/form-footer';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import SettingsFormNav, { settingsFormParts } from './settings-form-nav';
import CheckoutDeliverySettingsCard from './checkout-delivery-settings-card';

export default function SettingsForm() {
  const { data: settings, isLoading } = useStoreSettings();
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);

  const methods = useForm<UpdateStoreSettingsInput>({
    resolver: zodResolver(updateStoreSettingsSchema),
    defaultValues: {
      storeName: '',
      companyName: '',
      logoUrl: '',
      websiteUrl: '',
      supportEmail: '',
      supportPhone: '',
      address: { line1: '', line2: '', city: '', state: '', zip: '', country: '' },
      taxId: '',
      taxRate: 0,
      currency: 'USD',
      socialLinks: { instagram: '', facebook: '', whatsapp: '', x: '', threads: '' },
    },
  });

  const { register, control, watch, setValue, setError, reset, formState: { errors } } = methods;

  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName || '',
        companyName: settings.companyName || '',
        logoUrl: settings.logoUrl || '',
        websiteUrl: settings.websiteUrl || '',
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
        address: {
          line1: settings.address?.line1 || '',
          line2: settings.address?.line2 || '',
          city: settings.address?.city || '',
          state: settings.address?.state || '',
          zip: settings.address?.zip || '',
          country: settings.address?.country || '',
        },
        taxId: settings.taxId || '',
        taxRate: settings.taxRate || 0,
        currency: settings.currency || 'USD',
        socialLinks: {
          instagram: settings.socialLinks?.instagram || '',
          facebook: settings.socialLinks?.facebook || '',
          whatsapp: settings.socialLinks?.whatsapp || '',
          x: settings.socialLinks?.x || '',
          threads: settings.socialLinks?.threads || '',
        },
      });
    }
  }, [settings, reset]);

  useEffect(() => {
    if (apiErrors) {
      setBackendFormErrors(apiErrors, setError);
      setApiErrors(null);
    }
  }, [apiErrors, setError]);

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

  const handleSubmit: SubmitHandler<UpdateStoreSettingsInput> = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  const logoValue = watch('logoUrl');

  return (
    <div className="@container">
      <SettingsFormNav />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className="relative z-[19] [&_label.block>span]:font-medium"
        >
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">

            <Element name={settingsFormParts.logo}>
              <VerticalFormBlockWrapper
                title="Store Logo"
                description="Upload your store's logo to display across the storefront"
                className="pt-7 @2xl:pt-9 @3xl:pt-11"
              >
                {!logoValue ? (
                  <Controller
                    name="logoUrl"
                    control={control}
                    render={() => (
                      <UploadZone
                        name="logoUrl"
                        getValues={methods.getValues}
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
                  <div className="relative h-[200px] w-full max-w-sm rounded-lg border">
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
              </VerticalFormBlockWrapper>
            </Element>

            <Element name={settingsFormParts.basicInfo}>
              <VerticalFormBlockWrapper
                title="Basic Information"
                description="Core details about your store"
                className="pt-7 @2xl:pt-9 @3xl:pt-11"
              >
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

                <div className="mt-2 grid gap-4 @md:grid-cols-2">
                  <Input
                    label="Instagram"
                    placeholder="https://instagram.com/yourstore"
                    prefix={<PiInstagramLogoBold className="h-4 w-4" />}
                    {...register('socialLinks.instagram')}
                    error={(errors.socialLinks as any)?.instagram?.message}
                  />
                  <Input
                    label="Facebook"
                    placeholder="https://facebook.com/yourstore"
                    prefix={<PiFacebookLogoBold className="h-4 w-4" />}
                    {...register('socialLinks.facebook')}
                    error={(errors.socialLinks as any)?.facebook?.message}
                  />
                  <Input
                    label="WhatsApp"
                    placeholder="+2348012345678"
                    prefix={<PiWhatsappLogoBold className="h-4 w-4" />}
                    {...register('socialLinks.whatsapp')}
                    error={(errors.socialLinks as any)?.whatsapp?.message}
                  />
                  <Input
                    label="X (Twitter)"
                    placeholder="https://x.com/yourstore"
                    prefix={<RiTwitterXLine className="h-4 w-4" />}
                    {...register('socialLinks.x')}
                    error={(errors.socialLinks as any)?.x?.message}
                  />
                  <Input
                    label="Threads"
                    placeholder="https://threads.net/@yourstore"
                    prefix={<PiThreadsLogoBold className="h-4 w-4" />}
                    {...register('socialLinks.threads')}
                    error={(errors.socialLinks as any)?.threads?.message}
                  />
                </div>
              </VerticalFormBlockWrapper>
            </Element>

            <Element name={settingsFormParts.contact}>
              <VerticalFormBlockWrapper
                title="Contact Information"
                description="Support contact details shown to customers"
                className="pt-7 @2xl:pt-9 @3xl:pt-11"
              >
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
              </VerticalFormBlockWrapper>
            </Element>

            <Element name={settingsFormParts.address}>
              <VerticalFormBlockWrapper
                title="Address"
                description="Your store's physical or registered address"
                className="pt-7 @2xl:pt-9 @3xl:pt-11"
              >
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
              </VerticalFormBlockWrapper>
            </Element>

            <Element name={settingsFormParts.tax}>
              <VerticalFormBlockWrapper
                title="Tax Information"
                description="Tax ID and default tax rate applied to orders"
                className="pt-7 @2xl:pt-9 @3xl:pt-11"
              >
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
              </VerticalFormBlockWrapper>
            </Element>

            <Element name={settingsFormParts.delivery}>
              <div className="pt-7 @2xl:pt-9 @3xl:pt-11">
                <CheckoutDeliverySettingsCard />
              </div>
            </Element>

          </div>

          <FormFooter
            isLoading={updateMutation.isPending}
            submitBtnText="Save Settings"
            altBtnText="Reset"
            handleAltBtn={() => reset()}
          />
        </form>
      </FormProvider>
    </div>
  );
}
