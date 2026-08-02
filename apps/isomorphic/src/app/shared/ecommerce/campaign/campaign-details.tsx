'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { useCampaign } from '@/hooks/queries/useCampaigns';
import { useDeleteCampaign } from '@/hooks/mutations/useCampaignMutations';
import { Button, Text, Loader, Badge, Tooltip } from 'rizzui';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { PiPencilSimpleBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import { getCdnUrl } from '@core/utils/cdn-url';

interface CampaignDetailsProps {
  id: string;
}

export default function CampaignDetails({ id }: CampaignDetailsProps) {
  const router = useRouter();
  const { data: campaign, isLoading, isFetching } = useCampaign(id);

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

  if (isLoading || isFetching) {
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

  // Helpers for product rendering
  const formatPrice = (price?: number) =>
    typeof price === 'number'
      ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '—';

  // Attempt to find sales that reference a product (supporting legacy/new shapes)
  const getSalesForProduct = (productId: string) => {
    if (!Array.isArray(campaign.sales)) return [] as Array<{ _id: string; title: string }>;
    const matches: Array<{ _id: string; title: string }> = [];
    for (const sale of campaign.sales) {
      if (!sale || typeof sale === 'string') continue;
      // Legacy: sale.product?._id
      const anySale: any = sale as any;
      if (anySale.product && typeof anySale.product === 'object' && anySale.product._id === productId) {
        matches.push({ _id: sale._id, title: sale.title });
        continue;
      }
      // Alternative: sale.products as array of ids/objects
      if (Array.isArray(anySale.products)) {
        const found = anySale.products.some((p: any) => {
          if (!p) return false;
          if (typeof p === 'string') return p === productId;
          return p._id === productId;
        });
        if (found) {
          matches.push({ _id: sale._id, title: sale.title });
        }
      }
    }
    return matches;
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
              color={getStatusBadgeColor(campaign.status.toLowerCase())}
              className="capitalize"
            >
              {campaign.status}
            </Badge>
          </div>
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
              src={getCdnUrl(campaign.image)}
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
              const productImg = product.image || product.coverImage || '';
              const productSales = Array.isArray((product as any).linkedSales)
                ? (product as any).linkedSales
                : getSalesForProduct(product._id);
              return (
                <div
                  key={product._id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  {productImg && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={getCdnUrl(productImg)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {product.slug ? (
                        <Link
                          href={routes.eCommerce.productDetails(product.slug)}
                          className="truncate font-medium text-primary hover:underline"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        <Text className="truncate font-medium">{product.name}</Text>
                      )}
                      {product.status && (
                        <Badge variant="flat" size="sm" className="capitalize">
                          {product.status}
                        </Badge>
                      )}
                      {productSales.length > 0 && (
                        <Tooltip
                          content={
                            <div className="max-w-xs space-y-1">
                              <Text className="text-xs font-medium">Sales in this campaign:</Text>
                              {productSales.map((s: any) => (
                                <Link
                                  key={s._id}
                                  href={routes.eCommerce.flashSaleDetails(s._id)}
                                  className="block text-xs text-primary hover:underline"
                                >
                                  • {s.title}
                                </Link>
                              ))}
                            </div>
                          }
                        >
                          <Badge color="primary" size="sm">{productSales.length} sale(s)</Badge>
                        </Tooltip>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-600">
                      <span>{formatPrice(product.price)}</span>
                      {product.slug && (
                        <span className="truncate text-gray-400">• {product.slug}</span>
                      )}
                    </div>
                    {product.description && (
                      <Text className="mt-1 line-clamp-2 text-xs text-gray-500">{product.description}</Text>
                    )}
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
                    <Link
                      href={routes.eCommerce.flashSaleDetails(sale._id)}
                      className="font-medium text-primary hover:underline"
                    >
                      {sale.title}
                    </Link>
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
              Start
            </Text>
            <Text className="text-gray-900">
              {campaign.startDate
                ? new Date(campaign.startDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Infinity'}
            </Text>
          </div>
          <div>
            <Text className="mb-1 text-sm font-medium text-gray-700">Ends</Text>
            <Text className="text-gray-900">
              {campaign.endDate
                ? new Date(campaign.endDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Infinity'}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
