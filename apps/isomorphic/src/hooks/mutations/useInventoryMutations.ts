'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import { inventoryKeys } from '@/hooks/queries/useInventory';

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
};

export function useSetLowStockThreshold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, threshold }: { productId: string; threshold: number }) => {
      const response = await apiClient.patch(api.inventory.setThreshold(productId), { threshold });
      return response.message;
    },
    onSuccess: (message) => {
      invalidate(queryClient);
      toast.success(message || 'Threshold updated');
    },
    onError: (error) => toast.error(handleApiError(error)),
  });
}

export interface SetStockInput {
  productId: string;
  stock?: number;
  /** Per-variant stock; the total must equal the sum when both are sent. */
  variants?: Array<{ attributeName: string; childName: string; stock: number }>;
}

export function useSetStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, ...data }: SetStockInput) => {
      const response = await apiClient.patch(api.inventory.setStock(productId), data);
      return response.message;
    },
    onSuccess: (message) => {
      invalidate(queryClient);
      toast.success(message || 'Stock updated');
    },
    onError: (error) => toast.error(handleApiError(error)),
  });
}
