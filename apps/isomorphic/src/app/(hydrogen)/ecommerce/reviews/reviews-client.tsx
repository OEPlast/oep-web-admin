/**
 * All Reviews Page Client Component
 * Displays all reviews with statistics, filters, and table
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useReviews } from '@/hooks/queries/useReviews';
import { useDeleteReview } from '@/hooks/mutations/useReviewMutations';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import ReviewStatisticsCards from '@/app/shared/ecommerce/review/review-statistics-cards';
import ReviewFilters from '@/app/shared/ecommerce/review/review-filters';
import ReviewDetailDrawer from '@/app/shared/ecommerce/review/review-detail-drawer';
import { Button, Checkbox, Text, Loader, Badge } from 'rizzui';
import { PiStarFill, PiTrash, PiCheckCircle, PiXCircle } from 'react-icons/pi';
import type {
  ReviewFilters as ReviewFiltersType,
  Review,
} from '@/types/review.types';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { createColumnHelper } from '@tanstack/react-table';
import cn from '@core/utils/class-names';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { routes } from '@/config/routes';
import Link from 'next/link';

dayjs.extend(relativeTime);

const columnHelper = createColumnHelper<Review>();

export default function ReviewsPageClient() {
  const { openDrawer } = useDrawer();
  const [filters, setFilters] = useState<ReviewFiltersType>({
    page: 1,
    limit: 20,
    isApproved: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: reviewsData, isLoading, error } = useReviews(filters);
  console.log(reviewsData);

  const deleteMutation = useDeleteReview();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Extract reviews from paginated response
  const reviews = useMemo(() => reviewsData?.reviews || [], [reviewsData]);
  const pagination = reviewsData?.pagination;

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
            <Link href={routes.users.details(user!._id)} className="group">
              <Text className="font-medium text-gray-900 group-hover:underline">
                {user!.firstName + user!.lastName}
              </Text>
              <Text className="text-sm text-gray-500">
                {user?.email || 'N/A'}
              </Text>
            </Link>
          </div>
        );
      },
    }),
    columnHelper.accessor('product', {
      id: 'product',
      size: 200,
      header: 'Product',
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original.product;
        const prod = typeof product === 'object' ? product : null;
        return (
          <Link
            href={routes.eCommerce.productDetails(prod!._id)}
            className="group"
          >
            <Text className="font-medium text-gray-900 group-hover:underline">
              {prod?.name || 'Unknown Product'}
            </Text>
          </Link>
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
          <Text className="ml-1 text-sm font-medium">
            {row.original.rating}
          </Text>
        </div>
      ),
    }),
    columnHelper.accessor('review', {
      id: 'reviewText',
      size: 300,
      header: 'Review',
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          {row.original.title && (
            <Text className="mb-1 font-medium text-gray-900">
              {row.original.title}
            </Text>
          )}
          <Text className="line-clamp-2 text-sm text-gray-600">
            {row.original.review}
          </Text>
        </div>
      ),
    }),
    columnHelper.accessor('isApproved', {
      id: 'status',
      size: 120,
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          color={row.original.isApproved ? 'success' : 'danger'}
          variant="flat"
          className="font-medium"
        >
          {row.original.isApproved ? 'Live' : 'Removed'}
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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(row.original._id)}
          >
            View
          </Button>
        </div>
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
      enableRowSelection: true,
      manualPagination: true,
      pageCount: pagination?.totalPages,
    },
  });

  // Update table data when reviews change
  useEffect(() => {
    if (reviews) {
      setData(reviews);
    }
  }, [reviews, setData]);

  // Handle pagination changes via table state
  useEffect(() => {
    const state = table.getState();
    const newPage = state.pagination.pageIndex + 1;
    if (pagination && newPage !== pagination.page) {
      setFilters((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  }, [table.getState().pagination.pageIndex, pagination]);

  const handleViewDetails = (reviewId: string) => {
    openDrawer({
      view: <ReviewDetailDrawer reviewId={reviewId} />,
      placement: 'right',
      containerClassName: 'max-w-2xl',
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      isApproved: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <Text className="text-red-600">
          Failed to load reviews. Please try again.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <ReviewStatisticsCards />

      {/* Filters */}
      <ReviewFilters
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-muted bg-gray-50 p-4">
          <Text className="font-medium text-gray-700">
            {selectedRows.length} review(s) selected
          </Text>
        </div>
      )}

      {/* Reviews Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center rounded-lg border border-muted">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-muted bg-white p-12 text-center">
          <Text className="text-gray-500">
            No reviews found matching your filters.
          </Text>
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
          <div className="mt-4 flex items-center justify-end">
            <TablePagination table={table} className="py-4" />
          </div>
        </>
      )}
    </div>
  );
}
