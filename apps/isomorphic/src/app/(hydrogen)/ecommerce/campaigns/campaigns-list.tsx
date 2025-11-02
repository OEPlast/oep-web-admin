'use client';

import Link from 'next/link';
import Image from 'next/image';
import { routes } from '@/config/routes';
import { Button, Badge, Text, Title, Loader, Alert } from 'rizzui';
import {
  PiPlusBold,
  PiEyeBold,
  PiPencilBold,
  PiTrashBold,
  PiTagBold,
  PiShoppingBagBold,
} from 'react-icons/pi';
import { useState } from 'react';
import cn from '@core/utils/class-names';
import { useCampaignsList } from '@/hooks/queries/useCampaigns';
import {
  useDeleteCampaign,
  useToggleCampaignStatus,
} from '@/hooks/mutations/useCampaignMutations';
import toast from 'react-hot-toast';
import axios from 'axios';

type FilterType = 'all' | 'active' | 'inactive' | 'draft';

export default function CampaignsList() {
  const [filter, setFilter] = useState<FilterType>('all');

  const {
    data: campaignsData,
    isLoading,
    error,
  } = useCampaignsList(filter === 'all' ? undefined : { status: filter });

  const { mutate: deleteCampaign } = useDeleteCampaign({
    onSuccess: () => {
      toast.success('Campaign deleted successfully');
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

  const { mutate: toggleStatus } = useToggleCampaignStatus({
    onSuccess: (data) => {
      toast.success(
        `Campaign ${data.status === 'active' ? 'activated' : 'deactivated'} successfully`
      );
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendMessage =
          error.response.data?.message || 'Failed to update campaign status';
        toast.error(backendMessage);
      } else {
        toast.error('Something went wrong while updating campaign status');
      }
    },
  });

  const campaigns = campaignsData?.campaigns || [];

  const handleDelete = (id: string) => {
    deleteCampaign(id);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatus({ id, status: newStatus });
  };

  if (error) {
    return (
      <div className="@container">
        <Alert color="danger" className="mb-4">
          <Text className="font-medium">Failed to load campaigns</Text>
          <Text className="text-sm">
            {axios.isAxiosError(error) && error.response
              ? error.response.data?.message || 'Something went wrong'
              : 'Unable to connect to the server'}
          </Text>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-4 @container">
      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'solid' : 'outline'}
          onClick={() => setFilter('all')}
          className="rounded-lg text-sm sm:text-base"
          disabled={isLoading}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'solid' : 'outline'}
          onClick={() => setFilter('active')}
          className="rounded-lg text-sm sm:text-base"
          disabled={isLoading}
        >
          Active
        </Button>
        <Button
          variant={filter === 'inactive' ? 'solid' : 'outline'}
          onClick={() => setFilter('inactive')}
          className="rounded-lg text-sm sm:text-base"
          disabled={isLoading}
        >
          Inactive
        </Button>
        <Button
          variant={filter === 'draft' ? 'solid' : 'outline'}
          onClick={() => setFilter('draft')}
          className="rounded-lg text-sm sm:text-base"
          disabled={isLoading}
        >
          Draft
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader variant="spinner" size="xl" />
            <Text className="text-gray-600">Loading campaigns...</Text>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 @container sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
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
              <div
                key={campaign._id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md sm:p-6"
              >
                {/* Campaign Image */}
                <div className="mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    width={400}
                    height={200}
                    className="h-36 w-full object-cover transition-transform duration-200 group-hover:scale-105 sm:h-48"
                  />
                </div>

                {/* Campaign Info */}
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <Title
                      as="h3"
                      className="truncate text-base font-semibold sm:text-lg"
                    >
                      {campaign.title}
                    </Title>
                    <Badge
                      color={getStatusBadgeColor(campaign.status)}
                      className="shrink-0 capitalize"
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  {/* Slug */}
                  <Text className="mb-2 text-xs text-gray-500">
                    Slug: {campaign.slug}
                  </Text>

                  {/* Campaign Stats */}
                  <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <PiShoppingBagBold className="h-4 w-4 text-blue-500" />
                      <div>
                        <Text className="text-xs text-gray-500 sm:text-sm">
                          Products
                        </Text>
                        <Text className="text-sm font-medium sm:text-base">
                          {campaign.productsCount}
                        </Text>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PiTagBold className="h-4 w-4 text-green-500" />
                      <div>
                        <Text className="text-xs text-gray-500 sm:text-sm">
                          Sales
                        </Text>
                        <Text className="text-sm font-medium sm:text-base">
                          {campaign.salesCount}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <Text className="text-xs text-gray-500">
                    Created: {new Date(campaign.createdAt).toLocaleDateString()}
                  </Text>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={routes.eCommerce.CampaignDetails(campaign._id)}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      <PiEyeBold className="me-1 h-4 w-4" />
                      View
                    </Button>
                  </Link>

                  <Link
                    href={routes.eCommerce.editCampaign(campaign._id)}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full" size="sm">
                      <PiPencilBold className="me-1 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleToggleStatus(campaign._id, campaign.status)
                    }
                    className={cn(
                      'w-full shrink-0 sm:w-auto',
                      campaign.status === 'active'
                        ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                        : 'border-green-200 text-green-600 hover:bg-green-50'
                    )}
                  >
                    {campaign.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(campaign._id)}
                    className="w-full shrink-0 border-red-200 text-red-600 hover:bg-red-50 sm:w-auto"
                  >
                    <PiTrashBold className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && campaigns.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6">
          <PiTagBold className="mb-4 h-10 w-10 text-gray-400" />
          <Title
            as="h3"
            className="mb-2 text-base font-semibold text-gray-600 sm:text-lg"
          >
            No campaigns found
          </Title>
          <Text className="mb-4 text-sm text-gray-500 sm:text-base">
            {filter === 'all'
              ? "You haven't created any campaigns yet."
              : `No ${filter} campaigns found.`}
          </Text>
          <Link href={routes.eCommerce.createCampaign}>
            <Button>
              <PiPlusBold className="me-1.5 h-4 w-4" />
              Create Your First Campaign
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
