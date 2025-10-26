'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import { Product } from '@/hooks/queries/useProducts';

// Mutation context for optimistic updates
type MutationContext = {
  previousProducts?: Product[];
};

/**
 * Create Product Mutation
 */
export const useCreateProduct = (
  options?: Omit<UseMutationOptions<Product, Error, any, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, any, MutationContext>({
    mutationFn: async (data) => {
      const response = await apiClient.post<Product>(api.products.create, data);
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Create product error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Update Product Mutation
 */
export const useUpdateProduct = (
  options?: Omit<UseMutationOptions<Product, Error, { id: string; data: any }, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; data: any }, MutationContext>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<Product>(api.products.update(id), data);
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<{ data: Product[] }>(['products']);
      
      if (previousProducts) {
        queryClient.setQueryData<{ data: Product[] }>(['products'], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(p => p._id === id ? { ...p, ...data } : p)
          };
        });
      }
      
      return { previousProducts: previousProducts?.data };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      toast.success('Product updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], { data: context.previousProducts });
      }
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Update product error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Delete Product Mutation
 */
export const useDeleteProduct = (
  options?: Omit<UseMutationOptions<void, Error, string, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.products.delete(id));
    },
    onMutate: async (id) => {
      // Optimistic delete
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<{ data: Product[] }>(['products']);
      
      if (previousProducts) {
        queryClient.setQueryData<{ data: Product[] }>(['products'], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter(p => p._id !== id)
          };
        });
      }
      
      return { previousProducts: previousProducts?.data };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], { data: context.previousProducts });
      }
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Delete product error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Duplicate Product Mutation
 */
export const useDuplicateProduct = (
  options?: Omit<UseMutationOptions<Product, Error, string, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Product>(api.products.duplicate(id));
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product duplicated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Duplicate product error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Update Cover Image Mutation
 */
export const useUpdateCoverImage = (
  options?: Omit<UseMutationOptions<Product, Error, { id: string; imageId: string }, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; imageId: string }, MutationContext>({
    mutationFn: async ({ id, imageId }) => {
      const response = await apiClient.patch<Product>(api.products.updateCoverImage(id), { imageId });
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      toast.success('Cover image updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Update cover image error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Add Tags Mutation
 */
export const useAddTags = (
  options?: Omit<UseMutationOptions<Product, Error, { id: string; tags: string[] }, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; tags: string[] }, MutationContext>({
    mutationFn: async ({ id, tags }) => {
      const response = await apiClient.post<Product>(api.products.addTags(id), { tags });
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      toast.success('Tags added successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Add tags error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Remove Tag Mutation
 */
export const useRemoveTag = (
  options?: Omit<UseMutationOptions<Product, Error, { id: string; tag: string }, MutationContext>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: string; tag: string }, MutationContext>({
    mutationFn: async ({ id, tag }) => {
      const response = await apiClient.delete<Product>(api.products.removeTag(id, tag));
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      toast.success('Tag removed successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Remove tag error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
