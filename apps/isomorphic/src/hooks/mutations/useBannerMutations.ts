import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import { BannerType } from '@/app/shared/ecommerce/banners/banner-types';
import { toast } from 'react-hot-toast';

export type CreateBannerInput = {
  name: string;
  imageUrl: string;
  pageLink: string;
  active?: boolean;
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  position?: number;
};

export type UpdateBannerInput = Partial<CreateBannerInput>;

type MutationContext = {
  previousBanners?: BannerType[];
};

// Create banner mutation
export function useCreateBanner(
  options?: Omit<
    UseMutationOptions<BannerType, Error, CreateBannerInput, MutationContext>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<BannerType, Error, CreateBannerInput, MutationContext>({
    mutationFn: async (data: CreateBannerInput) => {
      const response = await apiClient.post<BannerType>(api.banners.create, data);
      
      if (!response.data) {
        throw new Error('Failed to create banner');
      }
      
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Update banner mutation
export function useUpdateBanner(
  options?: Omit<
    UseMutationOptions<
      BannerType,
      Error,
      { id: string; data: UpdateBannerInput },
      MutationContext
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    BannerType,
    Error,
    { id: string; data: UpdateBannerInput },
    MutationContext
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<BannerType>(api.banners.update(id), data);
      
      if (!response.data) {
        throw new Error('Failed to update banner');
      }
      
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables.id] });
      toast.success('Banner updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Delete banner mutation
export function useDeleteBanner(
  options?: Omit<UseMutationOptions<void, Error, string, MutationContext>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.banners.delete(id));
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables] });
      toast.success('Banner deleted successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Toggle banner active status mutation
export function useToggleBannerActive(
  options?: Omit<UseMutationOptions<BannerType, Error, string, MutationContext>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<BannerType, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<BannerType>(`/admin/banners/${id}/toggle-active`);
      
      if (!response.data) {
        throw new Error('Failed to toggle banner status');
      }
      
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      queryClient.invalidateQueries({ queryKey: ['banner', variables] });
      toast.success(data.active ? 'Banner activated' : 'Banner deactivated');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}
