'use client';

import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import {
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '@/data/campaigns-data';

/**
 * Create a new campaign
 */
export const useCreateCampaign = (
  options?: Omit<
    UseMutationOptions<Campaign, Error, CreateCampaignInput>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<Campaign, Error, CreateCampaignInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<Campaign>(
        api.campaigns.create,
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
  });
};

/**
 * Update an existing campaign
 */
export const useUpdateCampaign = (
  options?: Omit<
    UseMutationOptions<
      Campaign,
      Error,
      { id: string; data: UpdateCampaignInput }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Campaign,
    Error,
    { id: string; data: UpdateCampaignInput }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<Campaign>(
        api.campaigns.update(id),
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] });
      toast.success('Campaign updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: options?.onError,
  });
};

/**
 * Delete a campaign
 */
export const useDeleteCampaign = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(api.campaigns.delete(id));
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error('Failed to delete campaign');
      options?.onError?.(error, variables, context);
    },
  });
};

/**
 * Toggle campaign status (active/inactive)
 */
export const useToggleCampaignStatus = (
  options?: Omit<
    UseMutationOptions<
      Campaign,
      Error,
      { id: string; status: 'active' | 'inactive' }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Campaign,
    Error,
    { id: string; status: 'active' | 'inactive' }
  >({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch<Campaign>(
        api.campaigns.toggleStatus(id),
        { status }
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] });
      toast.success(
        `Campaign ${variables.status === 'active' ? 'activated' : 'deactivated'} successfully`
      );
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error('Failed to update campaign status');
      options?.onError?.(error, variables, context);
    },
  });
};
