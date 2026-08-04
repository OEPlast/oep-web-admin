'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type {
  OrdersTableResponse,
  TransactionsTableResponse,
  ProductPerformanceResponse,
  ReviewsTableResponse,
  OrdersTableParams,
  TransactionsTableParams,
  ReviewsTableParams,
  ProductPerformanceParams,
} from '@/types/analytics.types';



/**
 * Hook: useOrdersTable
 * Get paginated orders list with filters
 */
export const useOrdersTable = (
  params: OrdersTableParams,
  options?: Omit<
    UseQueryOptions<OrdersTableResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<OrdersTableResponse, Error>({
    queryKey: ['analytics', 'orders-table', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
      });
      if (params.status) {
        queryParams.append('status', params.status);
      }
      const response = await apiClient.get<OrdersTableResponse>(
        `${api.analytics.ordersTable}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for real-time updates)
    ...options,
  });
};

/**
 * Hook: useTransactionsTable
 * Get paginated transactions list with filters
 */
export const useTransactionsTable = (
  params: TransactionsTableParams,
  options?: Omit<
    UseQueryOptions<TransactionsTableResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<TransactionsTableResponse, Error>({
    queryKey: ['analytics', 'transactions-table', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc',
      });
      if (params.status) {
        queryParams.append('status', params.status);
      }
      if (params.method) {
        queryParams.append('method', params.method);
      }
      const response = await apiClient.get<TransactionsTableResponse>(
        `${api.analytics.transactionsTable}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};


/**
 * Hook: useProductPerformance
 * Get product-level metrics (revenue, sales, ratings) with pagination
 */
export const useProductPerformance = (
  params: Partial<ProductPerformanceParams>,
  options?: Omit<
    UseQueryOptions<ProductPerformanceResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ProductPerformanceResponse, Error>({
    queryKey: ['analytics', 'product-performance', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({});
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      queryParams.append('page', (params.page || 1).toString());
      queryParams.append('limit', (params.limit || 10).toString());
      queryParams.append('sortBy', params.sortBy || 'revenue');
      queryParams.append('sortOrder', params.sortOrder || 'desc');
      if (params.category) {
        queryParams.append('category', params.category);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }
      const response = await apiClient.get<ProductPerformanceResponse>(
        `${api.analytics.productPerformance}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 3 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useReviewsTable
 * Get paginated reviews with filters (rating, status)
 */
export const useReviewsTable = (
  params: ReviewsTableParams,
  options?: Omit<
    UseQueryOptions<ReviewsTableResponse, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<ReviewsTableResponse, Error>({
    queryKey: ['analytics', 'reviews-table', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        sortBy: params.sortBy || 'createdAt',
      });
      if (params.rating !== undefined) {
        queryParams.append('rating', params.rating.toString());
      }
      if (params.status) {
        queryParams.append('status', params.status);
      }
      const response = await apiClient.get<ReviewsTableResponse>(
        `${api.analytics.reviewsTable}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 3 * 60 * 1000,
    ...options,
  });
};



