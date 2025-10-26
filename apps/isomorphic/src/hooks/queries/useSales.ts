'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import {
  Sale,
  PaginatedSales,
  SalesFilters,
  SaleUsage,
  SaleType,
} from '@/types/sales';

/**
 * Hook to fetch all sales with pagination and filters
 */
export const useSales = (filters?: SalesFilters) => {
  return useQuery<PaginatedSales>({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString());
      if (filters?.deleted !== undefined)
        params.append('deleted', filters.deleted.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await apiClient.get<PaginatedSales>(
        `${api.sales.list}?${params.toString()}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnMount: true,
  });
};

/**
 * Hook to fetch a single sale by ID
 */
export const useSaleById = (id: string) => {
  return useQuery<Sale>({
    queryKey: ['sale', id],
    queryFn: async () => {
      const response = await apiClient.get<Sale>(api.sales.byId(id));
      if (!response.data) {
        throw new Error('Sale not found');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};

/**
 * Hook to fetch sales by type (Flash, Limited, Normal)
 */
export const useSalesByType = (
  type: SaleType,
  page?: number,
  limit?: number
) => {
  return useQuery<PaginatedSales>({
    queryKey: ['sales', 'type', type, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get<PaginatedSales>(
        `${api.sales.byType(type)}?${params.toString()}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

/**
 * Hook to fetch sale usage statistics
 */
export const useSaleUsage = (id: string) => {
  return useQuery<SaleUsage>({
    queryKey: ['sale', 'usage', id],
    queryFn: async () => {
      const response = await apiClient.get<SaleUsage>(api.sales.usage(id));
      if (!response.data) {
        throw new Error('Usage data not found');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds for usage data
  });
};

/**
 * Hook to fetch all active flash sales
 */
export const useActiveFlashSales = (page?: number, limit?: number) => {
  return useQuery<PaginatedSales>({
    queryKey: ['sales', 'active', 'flash', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get<PaginatedSales>(
        `${api.sales.activeFlash}?${params.toString()}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch all active limited sales
 */
export const useActiveLimitedSales = (page?: number, limit?: number) => {
  return useQuery<PaginatedSales>({
    queryKey: ['sales', 'active', 'limited', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get<PaginatedSales>(
        `${api.sales.activeLimited}?${params.toString()}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to fetch all active normal sales
 */
export const useActiveNormalSales = (page?: number, limit?: number) => {
  return useQuery<PaginatedSales>({
    queryKey: ['sales', 'active', 'normal', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get<PaginatedSales>(
        `${api.sales.activeNormal}?${params.toString()}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};
