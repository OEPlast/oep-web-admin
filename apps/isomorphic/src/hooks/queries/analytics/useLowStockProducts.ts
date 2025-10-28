/**
 * Low Stock Products Query Hook
 * 
 * React Query hook for fetching products with low stock levels.
 * Used in Stock Report dashboard component.
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type { LowStockProductsResponse } from '@/types/analytics.types';

interface LowStockProductsParams {
  page?: number;
  limit?: number;
}

/**
 * Hook: useLowStockProducts
 * Get paginated list of products where stock <= lowStockThreshold
 */
export const useLowStockProducts = (
  params: LowStockProductsParams = {},
  options?: Omit<UseQueryOptions<LowStockProductsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<LowStockProductsResponse, Error>({
    queryKey: ['analytics', 'low-stock-products', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(params.page || 1),
        limit: String(params.limit || 10),
      });
      const response = await apiClient.get<LowStockProductsResponse>(
        `${api.analytics.lowStockProducts}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (stock data changes frequently)
    ...options,
  });
};
