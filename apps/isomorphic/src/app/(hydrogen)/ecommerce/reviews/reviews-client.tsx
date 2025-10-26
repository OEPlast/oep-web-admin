/**
 * All Reviews Page Client Component
 * Displays all reviews with statistics, filters, and table
 */

'use client';

import { useState, useEffect } from 'react';
import { useReviews } from '@/hooks/queries/useReviews';
import { useDeleteReview, useBulkModerateReviews } from '@/hooks/mutations/useReviewMutations';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import ReviewStatisticsCards from '@/app/shared/ecommerce/review/review-statistics-cards';
import ReviewFilters from '@/app/shared/ecommerce/review/review-filters';
import ReviewDetailDrawer from '@/app/shared/ecommerce/review/review-detail-drawer';
import { Button, Checkbox, Text, Loader, Badge } from 'rizzui';
import { PiStarFill, PiTrash, PiCheckCircle, PiXCircle } from 'react-icons/pi';
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
  const deleteMutation = useDeleteReview();
  const bulkModerateMutation = useBulkModerateReviews();

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Extract reviews from paginated response
  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;
  const totalPages = pagination?.pages || 0;
  const totalReviews = pagination?.total || 0;

  const columns = [
    columnHelper.display({
      id: 'select',
      size: 50,
      header: ({ table }) => (
        <Checkbox
          className="ps-3.5"
          aria-label="Select all"
          checked={table.getIsAllPageRowsSelected()}
          onChange={() => table.toggleAllPageRowsSelected()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="ps-3.5"
          aria-label="Select row"
          checked={row.getIsSelected()}
          onChange={() => row.toggleSelected()}
        />
      ),
    }),
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
    columnHelper.accessor('product', {
      id: 'product',
      size: 200,
      header: 'Product',
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original.product;
        const prod = typeof product === 'object' ? product : null;
        return (
          <div>
            <Text className="font-medium text-gray-900">{prod?.name || 'Unknown Product'}</Text>
            <Text className="text-sm text-gray-500">SKU: {prod?.sku || 'N/A'}</Text>
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
      size: 300,
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
      onRowSelectionChange: (updater) => {
        const selection = typeof updater === 'function'
          ? updater(table.getState().rowSelection)
          : updater;
        const selectedIds = Object.keys(selection).map(
          (index) => reviews[Number(index)]._id
        );
        setSelectedRows(selectedIds);
      },
    },
  });

  // Update table data when reviews change
//   useEffect(() => {
//     if (reviews) {
//       setData(reviews);
//     }
//   }, [reviews, setData]);

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

  const handleBulkApprove = () => {
    if (selectedRows.length === 0) return;

    bulkModerateMutation.mutate(
      {
        reviewIds: selectedRows,
        action: 'approve',
      },
      {
        onSuccess: () => {
          setSelectedRows([]);
          table.resetRowSelection();
        },
      }
    );
  };

  const handleBulkReject = () => {
    if (selectedRows.length === 0) return;

    bulkModerateMutation.mutate(
      {
        reviewIds: selectedRows,
        action: 'reject',
      },
      {
        onSuccess: () => {
          setSelectedRows([]);
          table.resetRowSelection();
        },
      }
    );
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedRows.length} review(s)? This action cannot be undone.`
      )
    ) {
      // Delete reviews one by one (could be optimized with bulk delete endpoint)
      Promise.all(selectedRows.map((id) => deleteMutation.mutateAsync(id)))
        .then(() => {
          setSelectedRows([]);
          table.resetRowSelection();
        })
        .catch((error) => {
          console.error('Bulk delete error:', error);
        });
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <Text className="text-red-600">Failed to load reviews. Please try again.</Text>
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleBulkApprove}
              isLoading={bulkModerateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <PiCheckCircle className="mr-2 h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              size="sm"
              onClick={handleBulkReject}
              isLoading={bulkModerateMutation.isPending}
              variant="outline"
              className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
            >
              <PiXCircle className="mr-2 h-4 w-4" />
              Reject Selected
            </Button>
            <Button
              size="sm"
              onClick={handleBulkDelete}
              isLoading={deleteMutation.isPending}
              color="danger"
            >
              <PiTrash className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Reviews Table */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center rounded-lg border border-muted">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-muted bg-white p-12 text-center">
          <Text className="text-gray-500">No reviews found matching your filters.</Text>
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
              Showing {reviews.length} of {totalReviews.toLocaleString()} reviews (Page{' '}
              {filters.page} of {totalPages})
            </Text>
            <TablePagination table={table} className="py-4" />
          </div>
        </>
      )}
    </div>
  );
}
