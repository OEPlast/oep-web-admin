
'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type {
  ProfitLossChartData,
  TopProductsRevenueData,
  CategoriesPerformanceData,
  ChartParams,
  TopItemsParams,
} from '@/types/analytics.types';


/**
 * Hook: useProfitLossChart
 * Get profit/loss breakdown time-series data (revenue, expenses, returns)
 */
export const useProfitLossChart = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<ProfitLossChartData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProfitLossChartData[], Error>({
    queryKey: ['analytics', 'profit-loss-chart', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<ProfitLossChartData[]>(
        `${api.analytics.profitLossChart}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};










/**
 * Hook: useTopProductsRevenue
 * Get top N products by revenue for Bar charts
 */
export const useTopProductsRevenue = (
  params: TopItemsParams,
  options?: Omit<UseQueryOptions<TopProductsRevenueData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TopProductsRevenueData[], Error>({
    queryKey: ['analytics', 'top-products-revenue', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        limit: (params.limit || 10).toString(),
      });
      const response = await apiClient.get<TopProductsRevenueData[]>(
        `${api.analytics.topProductsRevenue}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useCategoriesPerformance
 * Get revenue and sales by product category for Bar charts
 */
export const useCategoriesPerformance = (
  params: { from: string; to: string },
  options?: Omit<UseQueryOptions<CategoriesPerformanceData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CategoriesPerformanceData[], Error>({
    queryKey: ['analytics', 'categories-performance', params],
    queryFn: async () => {
      const response = await apiClient.get<CategoriesPerformanceData[]>(
        `${api.analytics.categoriesPerformance}?from=${params.from}&to=${params.to}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};


