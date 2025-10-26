'use client';

import { useState, useEffect } from 'react';
import { Form } from '@core/ui/form';
import { useCreateCampaign } from '@/hooks/mutations/useCampaignMutations';
import {
  BackendValidationError,
  extractBackendErrors,
  setBackendFormErrors,
} from '@/libs/form-errors';
import {
  createCampaignSchema,
  CreateCampaignInput,
} from '@/validators/create-campaign.schema';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { Button } from 'rizzui';

import CampaignInfoForm from './components/CampaignInfoForm';
import CampaignImageUpload from './components/CampaignImageUpload';
import CampaignDatesForm from './components/CampaignDatesForm';
import CampaignProductsSection from './components/CampaignProductsSection';
import CampaignSalesSection from './components/CampaignSalesSection';

export default function CreateCampaign() {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(
    null
  );

  const createMutation = useCreateCampaign({
    onSuccess: () => {
      router.push(routes.eCommerce.campaign);
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

  const onSubmit = (data: CreateCampaignInput) => {
    setApiErrors(null);
    createMutation.mutate(data);
  };

  return (
    <Form<CreateCampaignInput>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onSubmit',
        defaultValues: {
          title: '',
          description: '',
          image: '',
          status: 'draft',
          products: [],
          sales: [],
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
        useEffect(() => {
          if (apiErrors) {
            setBackendFormErrors(apiErrors, setError);
            setApiErrors(null);
          }
        }, [apiErrors, setError]);

        return (
          <>
            {/* Image Upload */}
            <CampaignImageUpload
              control={control}
              getValues={getValues}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            {/* Campaign Info */}
            <CampaignInfoForm
              register={register}
              control={control}
              errors={errors}
            />

            {/* Dates */}
            <CampaignDatesForm control={control} errors={errors} />

            {/* Products Multi-Select */}
            <CampaignProductsSection control={control} errors={errors} />

            {/* Sales Multi-Select */}
            <CampaignSalesSection control={control} errors={errors} />

            {/* Submit Button */}
            <div className="flex gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full @xl:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createMutation.isPending}
                className="w-full @xl:w-auto"
              >
                Create Campaign
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
