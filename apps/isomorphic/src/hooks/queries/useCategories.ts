'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { CategoryType, CategoryWithSubs, CategoryListParams, CategoryListResponse } from '@/app/shared/ecommerce/categories/category-types';

// Hook to fetch all categories with pagination and filters
export function useCategories(
  params?: CategoryListParams,
  options?: Omit<UseQueryOptions<CategoryListResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.name) queryParams.append('name', params.name);

  const url = `${api.categories.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useQuery<CategoryListResponse, Error>({
    queryKey: ['categories', params],
    queryFn: async () => {
      const response = await apiClient.getWithMeta<CategoryType[], { page: number; limit: number; total: number; pages: number }>(url);
      
      return {
        items: response.data || [],
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 20,
        total: response.meta?.total || 0,
        totalPages: response.meta?.pages || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    ...options,
  });
}

// Hook to fetch single category by ID with populated subcategories
export function useCategory(
  id: string,
  options?: Omit<UseQueryOptions<CategoryWithSubs, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CategoryWithSubs, Error>({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await apiClient.get<CategoryWithSubs>(api.categories.byId(id));
      if (!response.data) {
        throw new Error('Category not found');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook to fetch all categories (no pagination) for dropdown selections
export function useAllCategories(
  options?: Omit<UseQueryOptions<CategoryType[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<CategoryType[], Error>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      // Fetch with high limit to get all categories
      const response = await apiClient.getWithMeta<{ categories: CategoryType[] }, any>(
        `${api.categories.list}?limit=1000`
      );
      return response.data?.categories || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
