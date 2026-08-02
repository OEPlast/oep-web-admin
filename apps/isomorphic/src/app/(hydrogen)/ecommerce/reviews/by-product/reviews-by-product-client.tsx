/**
 * Reviews by Product Page Client Component
 * Filter and display reviews for a specific product
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProductReviews } from '@/hooks/queries/useReviews';
import { useProductSearch, type Product } from '@/hooks/queries/useProducts';
import { useDrawer } from '@/app/shared/drawer-views/use-drawer';
import { useDebounce } from '@/hooks/use-debounce';
import ReviewDetailDrawer from '@/app/shared/ecommerce/review/review-detail-drawer';
import { Button, Text, Loader, Badge, Input } from 'rizzui';
import { PiStarFill, PiPackage, PiMagnifyingGlassBold } from 'react-icons/pi';
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
import { getCdnUrl } from '@core/utils/cdn-url';

dayjs.extend(relativeTime);

const columnHelper = createColumnHelper<Review>();

export default function ReviewsByProductClient() {
  const { openDrawer } = useDrawer();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ReviewFiltersType>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Only search if debounced query is 2+ characters
  const shouldSearch = debouncedSearchQuery.length >= 2;
  const { data: searchResults, isLoading: isSearching } = useProductSearch(
    shouldSearch ? debouncedSearchQuery : '',
    shouldSearch
  );

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    error,
  } = useProductReviews(selectedProduct?._id || '', filters, {
    enabled: !!selectedProduct,
  });

  const reviews = useMemo(
    () => reviewsData?.reviews || [],
    [reviewsData?.reviews]
  );
  const pagination = reviewsData?.pagination;
  const totalReviews = pagination?.total || 0;

  console.log(reviews);
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
                {user?.firstName + ' ' + user?.lastName}
              </Text>
              <Text className="text-sm text-gray-500">
                {user?.email || 'N/A'}
              </Text>
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
          <Text className="ml-1 text-sm font-medium">
            {row.original.rating}
          </Text>
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

  // Update table data when reviews change
  useEffect(() => {
    if (reviews) {
      setData(reviews);
    }
  }, [reviews, setData]); // setData is stable, safe to include

  const handleViewDetails = (reviewId: string) => {
    openDrawer({
      view: <ReviewDetailDrawer reviewId={reviewId} />,
      placement: 'right',
      containerClassName: 'max-w-2xl',
    });
  };

  const handleSelectProduct = (productId: string) => {
    const product = searchResults?.find((p) => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setSearchQuery('');
      setFilters((prev) => ({ ...prev, page: 1 })); // Reset to first page
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Search */}
      <div className="rounded-lg border border-muted bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <PiPackage className="h-5 w-5 text-gray-600" />
          <Text className="font-semibold text-gray-900">Search Product</Text>
        </div>

        <div className="relative">
          <Input
            type="search"
            placeholder="Search by product name, SKU (min 2 characters)..."
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
                searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectProduct(product._id)}
                    className="flex w-full items-center gap-3 border-b border-muted p-3 text-left transition-colors last:border-0 hover:bg-gray-50"
                  >
                    <img
                      src={getCdnUrl(product.description_images?.[0]?.url)}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <Text className="font-medium text-gray-900">
                        {product.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </Text>
                    </div>
                    {product.reviewCount !== undefined && (
                      <Badge variant="flat" className="text-xs">
                        {product.reviewCount}{' '}
                        {product.reviewCount === 1 ? 'review' : 'reviews'}
                      </Badge>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center">
                  <Text className="text-sm text-gray-500">
                    No products found
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedProduct && (
          <div className="mt-4 space-y-2">
            <Text className="text-xs font-medium uppercase text-gray-500">
              Currently Viewing Reviews For:
            </Text>
            <div className="flex items-center justify-between rounded-lg border-2 border-primary bg-primary-lighter/20 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={getCdnUrl(selectedProduct.description_images?.[0]?.url)}
                  alt={selectedProduct.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div>
                  <Text className="font-semibold text-gray-900">
                    {selectedProduct.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    SKU: {selectedProduct.sku}
                  </Text>
                  <Badge color="success" variant="flat" className="mt-1">
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProduct(null);
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
      {!selectedProduct ? (
        <div className="rounded-lg border border-muted bg-white p-12 text-center">
          <PiPackage className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <Text className="text-gray-500">
            Select a product to view its reviews
          </Text>
        </div>
      ) : isLoadingReviews ? (
        <div className="flex h-96 items-center justify-center rounded-lg border border-muted">
          <Loader variant="spinner" size="xl" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <Text className="text-red-600">
            Failed to load reviews. Please try again.
          </Text>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-muted bg-white p-12 text-center">
          <Text className="text-gray-500">
            No reviews found for this product.
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
