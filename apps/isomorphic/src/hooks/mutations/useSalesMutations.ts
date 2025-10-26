'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import {
  Sale,
  CreateSaleInput,
  UpdateSaleInput,
} from '@/types/sales';

/**
 * Hook to create a new sale
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSaleInput) => {
      const response = await apiClient.post<Sale>(api.sales.create, data);
      if (!response.data) {
        throw new Error('Failed to create sale');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'type'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'active'] });
      toast.success(
        data.title
          ? `Sale "${data.title}" created successfully`
          : 'Sale created successfully'
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to create sale: ${error.message}`);
      console.error('Create sale error:', error);
    },
  });
};

/**
 * Hook to update an existing sale
 */
export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSaleInput }) => {
      const response = await apiClient.put<Sale>(api.sales.update(id), data);
      if (!response.data) {
        throw new Error('Failed to update sale');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'type'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'active'] });
      toast.success(
        data.title
          ? `Sale "${data.title}" updated successfully`
          : 'Sale updated successfully'
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to update sale: ${error.message}`);
      console.error('Update sale error:', error);
    },
  });
};

/**
 * Hook to delete a sale
 */
export const useDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.sales.delete(id));
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'type'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'active'] });
      toast.success('Sale deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete sale: ${error.message}`);
      console.error('Delete sale error:', error);
    },
  });
};

/**
 * Hook to toggle sale active status
 */
export const useToggleSaleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiClient.put<Sale>(api.sales.update(id), {
        isActive,
      });
      if (!response.data) {
        throw new Error('Failed to toggle sale status');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'type'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'active'] });
      toast.success(
        `Sale ${variables.isActive ? 'activated' : 'deactivated'} successfully`
      );
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle sale status: ${error.message}`);
      console.error('Toggle sale status error:', error);
    },
  });
};

/**
 * Hook to decrement sale limit (when a purchase is made)
 */
export const useDecrementSaleLimit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      variantIndex,
    }: {
      id: string;
      variantIndex?: number;
    }) => {
      const response = await apiClient.post<Sale>(api.sales.decrement(id), {
        variantIndex,
      });
      if (!response.data) {
        throw new Error('Failed to decrement sale limit');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sale', 'usage', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      // Don't show toast for this operation as it's automated
    },
    onError: (error: Error) => {
      toast.error(`Failed to record sale usage: ${error.message}`);
      console.error('Decrement sale limit error:', error);
    },
  });
};

/**
 * Hook to soft delete a sale (set deleted flag)
 */
export const useSoftDeleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put<Sale>(api.sales.update(id), {
        deleted: true,
      });
      if (!response.data) {
        throw new Error('Failed to delete sale');
      }
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'type'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'active'] });
      toast.success('Sale deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete sale: ${error.message}`);
      console.error('Soft delete sale error:', error);
    },
  });
};
