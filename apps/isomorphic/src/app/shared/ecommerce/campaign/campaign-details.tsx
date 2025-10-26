'use client';

import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { useCampaign } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useCampaignMutations';
import { Button, Text, Loader, Badge } from 'rizzui';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { PiPencilSimpleBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';

interface CampaignDetailsProps {
  id: string;
}

export default function CampaignDetails({ id }: CampaignDetailsProps) {
  const router = useRouter();
  const { data: campaign, isLoading } = useCampaign(id);

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

  const handleDelete = () => {
    deleteCampaign(id);
  };

  const handleEdit = () => {
    router.push(routes.eCommerce.editCampaign(id));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader variant="spinner" size="xl" />
          <Text className="text-gray-600">Loading campaign details...</Text>
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'draft':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Text className="text-2xl font-semibold">{campaign.title}</Text>
            <Badge
              variant="flat"
              color={getStatusBadgeColor(campaign.status)}
              className="capitalize"
            >
              {campaign.status}
            </Badge>
          </div>
          {campaign.description && (
            <Text className="text-gray-600">{campaign.description}</Text>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={isDeleting}
            className="gap-2"
          >
            <PiPencilSimpleBold className="h-4 w-4" />
            Edit
          </Button>
          <DeletePopover
            title="Delete Campaign"
            description="Are you sure you want to delete this campaign? This action cannot be undone."
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Campaign Image */}
      {campaign.image && (
        <div className="rounded-lg border border-gray-200 p-6">
          <Text className="mb-4 text-lg font-semibold">Campaign Image</Text>
          <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Campaign Dates */}
      {(campaign.startDate || campaign.endDate) && (
        <div className="rounded-lg border border-gray-200 p-6">
          <Text className="mb-4 text-lg font-semibold">Campaign Duration</Text>
          <div className="grid gap-4 sm:grid-cols-2">
            {campaign.startDate && (
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  Start Date
                </Text>
                <Text className="text-gray-900">
                  {new Date(campaign.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </div>
            )}
            {campaign.endDate && (
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  End Date
                </Text>
                <Text className="text-gray-900">
                  {new Date(campaign.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      {campaign.products && campaign.products.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-6">
          <Text className="mb-4 text-lg font-semibold">
            Products ({campaign.products.length})
          </Text>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaign.products.map((product) => {
              if (typeof product === 'string') return null;
              return (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  {(product.image || product.coverImage) && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={product.image || product.coverImage || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Text className="truncate font-medium">{product.name}</Text>
                    <Text className="text-sm text-gray-600">
                      ${product.price}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sales */}
      {campaign.sales && campaign.sales.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-6">
          <Text className="mb-4 text-lg font-semibold">
            Sales ({campaign.sales.length})
          </Text>
          <div className="space-y-3">
            {campaign.sales.map((sale) => {
              if (typeof sale === 'string') return null;
              return (
                <div
                  key={sale._id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <Text className="font-medium">{sale.title}</Text>
                    <Text className="mt-1 text-sm text-gray-600">
                      {sale.type} Sale
                    </Text>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-right">
                    <Badge color={sale.isActive ? 'success' : 'secondary'}>
                      {sale.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="rounded-lg border border-gray-200 p-6">
        <Text className="mb-4 text-lg font-semibold">Campaign Information</Text>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Text className="mb-1 text-sm font-medium text-gray-700">
              Created At
            </Text>
            <Text className="text-gray-900">
              {new Date(campaign.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>
          <div>
            <Text className="mb-1 text-sm font-medium text-gray-700">
              Last Updated
            </Text>
            <Text className="text-gray-900">
              {new Date(campaign.updatedAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
