'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { CategoryListOption } from '@/app/shared/ecommerce/categories/category-types';
import { useMemo } from 'react';

/**
 * Hook to fetch all categories for parent selection dropdown
 * @param excludeId - Optional category ID to exclude from results (prevents circular parent references)
 * @returns Query result with formatted options for Select component
 */
export const useParentCategoryOptions = (excludeId?: string) => {
  const { data, isLoading, error, isError } = useQuery<CategoryListOption[]>({
    queryKey: ['categories', 'list-all'],
    queryFn: async () => {
      const response = await apiClient.get<CategoryListOption[]>(api.categories.getList);
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Format data for Select component and filter out excluded ID
  const options = useMemo(() => {
    if (!data) return [];
    
    return data
      .filter((category) => category._id !== excludeId)
      .map((category) => ({
        value: category._id,
        label: category.name,
      }));
  }, [data, excludeId]);

  return {
    data: options,
    isLoading,
    error,
    isError,
  };
};
