'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import { CategoryType } from '@/app/shared/ecommerce/categories/category-types';
import { CreateCategoryFormInput, UpdateCategoryFormInput } from '@/validators/create-category.schema';

type MutationContext = {
  previousCategories?: CategoryType[];
};

// Create category mutation
export const useCreateCategory = (
  options?: Omit<UseMutationOptions<CategoryType, Error, CreateCategoryFormInput, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<CategoryType, Error, CreateCategoryFormInput, MutationContext>({
    mutationFn: async (data: CreateCategoryFormInput) => {
      const response = await apiClient.post<CategoryType>(api.categories.create, data);
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Create category error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update category mutation
export const useUpdateCategory = (
  options?: Omit<
    UseMutationOptions<CategoryType, Error, { id: string; data: UpdateCategoryFormInput }, MutationContext>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<CategoryType, Error, { id: string; data: UpdateCategoryFormInput }, MutationContext>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<CategoryType>(api.categories.update(id), data);
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
      toast.success('Category updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Update category error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Delete category mutation
export const useDeleteCategory = (
  options?: Omit<UseMutationOptions<void, Error, string, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.categories.delete(id));
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Delete category error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
