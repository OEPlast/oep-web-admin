/**
 * Reviews by Product Page Client Component
 * Filter and display reviews for a specific product
 */

'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/queries/useReviews';
import { useProductReviews } from '@/hooks/queries/useReviews';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import ReviewDetailDrawer from '@/app/shared/ecommerce/review/review-detail-drawer';
import { Select, Button, Text, Loader, Badge, Avatar } from 'rizzui';
import { PiStarFill, PiPackage } from 'react-icons/pi';
import type { ReviewFilters as ReviewFiltersType, Review } from '@/types/review.types';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { createColumnHelper } from '@tanstack/react-table';
import cn from '@core/utils/class-names';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const columnHelper = createColumnHelper<Review>();

export default function ReviewsByProductClient() {
  const { openDrawer } = useDrawer();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<{ _id: string; name: string; sku: number; image: string } | null>(null);
  const [filters, setFilters] = useState<ReviewFiltersType>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: products, isLoading: isLoadingProducts } = useProducts();
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error,
  } = useProductReviews(selectedProductId, filters, {
    enabled: !!selectedProductId,
  });

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;
  const totalReviews = pagination?.total || 0;

  const columns = [
    columnHelper.accessor('reviewBy', {
      id: 'customer',
      size: 250,
      header: 'Customer',
      enableSorting: false,
      cell: ({ row }) => {
        const reviewBy = row.original.reviewBy;
        const user = typeof reviewBy === 'object' ? reviewBy : null;
        return (
          <div className="flex items-start gap-2">
            <div>
              <Text className="font-medium text-gray-900">
                {user?.name || 'Unknown User'}
              </Text>
              <Text className="text-sm text-gray-500">{user?.email || 'N/A'}</Text>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('rating', {
      id: 'rating',
      size: 120,
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <PiStarFill
              key={i}
              className={cn(
                'h-4 w-4',
                i < row.original.rating
                  ? 'fill-orange text-orange'
                  : 'fill-gray-300 text-gray-300'
              )}
            />
          ))}
          <Text className="ml-1 text-sm font-medium">{row.original.rating}</Text>
        </div>
      ),
    }),
    columnHelper.accessor('review', {
      id: 'reviewText',
      size: 400,
      header: 'Review',
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          {row.original.title && (
            <Text className="mb-1 font-medium text-gray-900">{row.original.title}</Text>
          )}
          <Text className="line-clamp-2 text-sm text-gray-600">{row.original.review}</Text>
        </div>
      ),
    }),
    columnHelper.accessor('isApproved', {
      id: 'status',
      size: 120,
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          color={row.original.isApproved ? 'success' : 'warning'}
          variant="flat"
          className="font-medium"
        >
          {row.original.isApproved ? 'Approved' : 'Pending'}
        </Badge>
      ),
    }),
    columnHelper.accessor('createdAt', {
      id: 'date',
      size: 150,
      header: 'Date',
      cell: ({ row }) => (
        <div>
          <Text className="text-sm text-gray-900">
            {dayjs(row.original.createdAt).format('MMM D, YYYY')}
          </Text>
          <Text className="text-xs text-gray-500">
            {dayjs(row.original.createdAt).fromNow()}
          </Text>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      size: 100,
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewDetails(row.original._id)}
        >
          View
        </Button>
      ),
    }),
  ];

  const { table, setData } = useTanStackTable<Review>({
    tableData: reviews,
    columnConfig: columns,
    options: {
      initialState: {
        pagination: {
          pageIndex: filters.page ? filters.page - 1 : 0,
          pageSize: filters.limit || 20,
        },
      },
    },
  });
/*
  // Update table data when reviews change
  useEffect(() => {
    if (reviews) {
      setData(reviews);
    }
  }, [reviews]); // setData is stable, no need in deps
*/
  const handleViewDetails = (reviewId: string) => {
    openDrawer({
      view: <ReviewDetailDrawer reviewId={reviewId} />,
      placement: 'right',
      containerClassName: 'max-w-2xl',
    });
  };

  return (
    <div className="space-y-6">
      {/* Product Selector */}
      <div className="rounded-lg border border-muted bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <PiPackage className="h-5 w-5 text-gray-600" />
          <Text className="font-semibold text-gray-900">Select Product</Text>
        </div>

        {isLoadingProducts ? (
          <div className="flex h-20 items-center justify-center">
            <Loader variant="spinner" />
          </div>
        ) : (
          <>
            <Select
              value={selectedProductId}
              onChange={(value) => {
                const productId = value as string;
                setSelectedProductId(productId);
                const product = products?.find((p) => p._id === productId);
                if (product) {
                  setSelectedProduct(product);
                }
              }}
              options={
                products?.map((p) => ({
                  label: p.name,
                  value: p._id,
                })) || []
              }
              placeholder="Select a product..."
              displayValue={(value) => {
                const product = products?.find((p) => p._id === value);
                return product?.name || 'Select a product...';
              }}
              className="mb-4"
            />

            {selectedProduct && (
              <div className="mt-4 space-y-2">
                <Text className="text-xs font-medium uppercase text-gray-500">
                  Currently Viewing Reviews For:
                </Text>
                <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary-lighter/20 p-4">
                  <Avatar
                    src={selectedProduct.image}
                    name={selectedProduct.name}
                    size="lg"
                    className="rounded-lg ring-2 ring-primary"
                  />
                  <div className="flex-1">
                    <Text className="font-semibold text-gray-900">{selectedProduct.name}</Text>
                    <Text className="text-sm text-gray-600">SKU: {selectedProduct.sku}</Text>
                    <Badge color="success" variant="flat" className="mt-1">
                      {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reviews Table */}
      {!selectedProductId ? (
        <div className="rounded-lg border border-muted bg-white p-12 text-center">
          <PiPackage className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <Text className="text-gray-500">Select a product to view its reviews</Text>
        </div>
      ) : isLoadingReviews ? (
        <div className="flex h-96 items-center justify-center rounded-lg border border-muted">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <Text className="text-red-600">Failed to load reviews. Please try again.</Text>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-muted bg-white p-12 text-center">
          <Text className="text-gray-500">No reviews found for this product.</Text>
        </div>
      ) : (
        <>
          <Table
            table={table}
            variant="modern"
            classNames={{
              container: 'border border-muted rounded-lg',
              rowClassName: 'cursor-pointer hover:bg-gray-50',
            }}
          />
          <div className="mt-4 flex items-center justify-between">
            <Text className="text-sm text-gray-600">
              Showing {reviews.length} of {totalReviews} reviews
            </Text>
            <TablePagination table={table} className="py-4" />
          </div>
        </>
      )}
    </div>
  );
}
