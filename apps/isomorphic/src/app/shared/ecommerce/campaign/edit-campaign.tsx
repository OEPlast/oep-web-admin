'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@core/ui/form';
import { routes } from '@/config/routes';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateCampaignInput,
  createCampaignSchema,
} from '@/validators/create-campaign.schema';
import CampaignInfoForm from './components/CampaignInfoForm';
import CampaignImageUpload from './components/CampaignImageUpload';
import CampaignDatesForm from './components/CampaignDatesForm';
import CampaignProductsSection from './components/CampaignProductsSection';
import CampaignSalesSection from './components/CampaignSalesSection';
import { Button, Text, Loader, ActionIcon } from 'rizzui';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  useUpdateCampaign,
  useDeleteCampaign,
} from '@/hooks/mutations/useCampaignMutations';
import { useCampaign } from '@/hooks/queries/useCampaigns';
import {
  BackendValidationError,
  extractBackendErrors,
  setBackendFormErrors,
} from '@/libs/form-errors';
import { PiTrashBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';

interface EditCampaignProps {
  id: string;
}

export default function EditCampaign({ id }: EditCampaignProps) {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(
    null
  );

  const {
    data: campaign,
    isLoading: isFetching,
    refetch: refetchUseCampaign,
  } = useCampaign(id);

  const { mutate: updateCampaign, isPending: isUpdating } = useUpdateCampaign({
    onSuccess: () => {
      // refetchUseCampaign();
      toast.success('Campaign updated successfully');
      router.push(routes.eCommerce.CampaignDetails(id));
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error);
        if (backendErrors) {
          setApiErrors(backendErrors);
        } else {
          const backendMessage =
            error.response.data?.message || 'Failed to update campaign';
          toast.error(backendMessage);
        }
      } else {
        toast.error('Something went wrong while updating campaign');
      }
    },
  });

  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign({
    onSuccess: () => {
      toast.success('Campaign deleted successfully');
      router.push(routes.eCommerce.campaign);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage =
          error.response.data?.message || 'Failed to delete campaign';
        toast.error(backendMessage);
      } else {
        toast.error('Something went wrong while deleting campaign');
      }
    },
  });

  const onSubmit: SubmitHandler<CreateCampaignInput> = (data) => {
    updateCampaign({ id, data });
  };

  const handleDelete = () => {
    deleteCampaign(id);
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader variant="spinner" size="xl" />
          <Text className="text-gray-600">Loading campaign...</Text>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Text className="text-gray-600">Campaign not found</Text>
      </div>
    );
  }

  return (
    <Form<CreateCampaignInput>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onSubmit',
        resolver: zodResolver(createCampaignSchema),
        defaultValues: campaign
          ? {
              slug: (campaign as any).slug || '',
              title: campaign.title,
              description: campaign.description || '',
              image: campaign.image,
              status: campaign.status,
              startDate: campaign.startDate
                ? new Date(campaign.startDate)
                : undefined,
              endDate: campaign.endDate
                ? new Date(campaign.endDate)
                : undefined,
              products: campaign.products
                ? campaign.products.map((p) =>
                    typeof p === 'string' ? p : p._id
                  )
                : [],
              sales: campaign.sales
                ? campaign.sales.map((s) => (typeof s === 'string' ? s : s._id))
                : [],
            }
          : undefined,
      }}
      className="@container"
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
          <div className="space-y-6">
            {/* Header with Delete Button */}
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-xl font-semibold">Edit Campaign</Text>
                <Text className="text-sm text-gray-600">
                  Update campaign information and settings
                </Text>
              </div>
              <DeletePopover
                title="Delete Campaign"
                description="Are you sure you want to delete this campaign? This action cannot be undone."
                onDelete={handleDelete}
              />
            </div>

            {/* Campaign Info */}
            <div className="rounded-lg border border-gray-200 p-6">
              <CampaignInfoForm
                register={register}
                errors={errors}
                control={control}
                excludeId={id}
              />
            </div>

            {/* Campaign Image */}
            <div className="rounded-lg border border-gray-200 p-6">
              <CampaignImageUpload
                control={control}
                errors={errors}
                getValues={getValues}
                setValue={setValue}
                watch={watch}
              />
            </div>

            {/* Campaign Dates */}
            <div className="rounded-lg border border-gray-200 p-6">
              <CampaignDatesForm control={control} errors={errors} />
            </div>

            {/* Products Selection */}
            <div className="rounded-lg border border-gray-200 p-6">
              <CampaignProductsSection control={control} errors={errors} />
            </div>

            {/* Sales Selection */}
            <div className="rounded-lg border border-gray-200 p-6">
              <CampaignSalesSection control={control} errors={errors} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(routes.eCommerce.campaign)}
                disabled={isUpdating || isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isUpdating}
                disabled={isDeleting}
              >
                Update Campaign
              </Button>
            </div>
          </div>
        );
      }}
    </Form>
  );
}
