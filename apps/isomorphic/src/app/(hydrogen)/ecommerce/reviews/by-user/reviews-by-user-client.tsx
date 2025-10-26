/**
 * Reviews by User Page Client Component
 * Search for users and display their reviews
 */

'use client';

import { useState, useEffect } from 'react';
import { useUserSearch } from '@/hooks/queries/useReviews';
import { useUserReviews } from '@/hooks/queries/useReviews';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import ReviewDetailDrawer from '@/app/shared/ecommerce/review/review-detail-drawer';
import { Input, Button, Text, Loader, Badge, Avatar } from 'rizzui';
import { PiStarFill, PiUser, PiMagnifyingGlassBold } from 'react-icons/pi';
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

export default function ReviewsByUserClient() {
  const { openDrawer } = useDrawer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<{ _id: string; name: string; email: string; reviewCount: number } | null>(null);
  const [filters, setFilters] = useState<ReviewFiltersType>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: searchResults, isLoading: isSearching } = useUserSearch(searchQuery);
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error,
  } = useUserReviews(selectedUserId, filters, {
    enabled: !!selectedUserId,
  });

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;
  const totalReviews = pagination?.total || 0;

  const columns = [
    columnHelper.accessor('product', {
      id: 'product',
      size: 250,
      header: 'Product',
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original.product;
        const prod = typeof product === 'object' ? product : null;
        return (
          <div className="flex items-center gap-2">
            <Avatar
              src={prod?.image}
              name={prod?.name || 'Product'}
              size="sm"
              className="rounded-lg"
            />
            <div>
              <Text className="font-medium text-gray-900">{prod?.name || 'Unknown Product'}</Text>
              <Text className="text-sm text-gray-500">SKU: {prod?.sku || 'N/A'}</Text>
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

  const handleSelectUser = (userId: string) => {
    const user = searchResults?.find((u) => u._id === userId);
    if (user) {
      setSelectedUserId(userId);
      setSelectedUser(user);
      setSearchQuery('');
    }
  };

  return (
    <div className="space-y-6">
      {/* User Search */}
      <div className="rounded-lg border border-muted bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <PiUser className="h-5 w-5 text-gray-600" />
          <Text className="font-semibold text-gray-900">Search User</Text>
        </div>

        <div className="relative">
          <Input
            type="search"
            placeholder="Search by name or email (min 2 characters)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            clearable={true}
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            className="mb-2"
          />

          {/* Search Results Dropdown */}
          {searchQuery.length >= 2 && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-muted bg-white shadow-lg">
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <Loader variant="spinner" size="sm" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className="flex w-full items-center gap-3 border-b border-muted p-3 text-left transition-colors hover:bg-gray-50 last:border-0"
                  >
                    <Avatar name={user.name} size="sm" />
                    <div className="flex-1">
                      <Text className="font-medium text-gray-900">{user.name}</Text>
                      <Text className="text-sm text-gray-500">{user.email}</Text>
                    </div>
                    <Badge variant="flat" className="text-xs">
                      {user.reviewCount} {user.reviewCount === 1 ? 'review' : 'reviews'}
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center">
                  <Text className="text-sm text-gray-500">No users found</Text>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="mt-4 space-y-2">
            <Text className="text-xs font-medium uppercase text-gray-500">
              Currently Viewing Reviews By:
            </Text>
            <div className="flex items-center justify-between rounded-lg border-2 border-primary bg-primary-lighter/20 p-4">
              <div className="flex items-center gap-3">
                <Avatar 
                  name={selectedUser.name} 
                  size="lg" 
                  className="ring-2 ring-primary"
                />
                <div>
                  <Text className="font-semibold text-gray-900">{selectedUser.name}</Text>
                  <Text className="text-sm text-gray-600">{selectedUser.email}</Text>
                  <Badge color="success" variant="flat" className="mt-1">
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedUserId('');
                  setSelectedUser(null);
                  setSearchQuery('');
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      {!selectedUserId ? (
        <div className="rounded-lg border border-muted bg-white p-12 text-center">
          <PiUser className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <Text className="text-gray-500">Search and select a user to view their reviews</Text>
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
          <Text className="text-gray-500">This user hasn't written any reviews yet.</Text>
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
