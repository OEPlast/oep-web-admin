'use client';

import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Intent,
  IntentStatus,
  CreateIntentInput,
  UpdateIntentInput,
} from '@/data/intents-data';

/**
 * The backend surfaces slug clashes (409) and Mongoose validation failures (400)
 * with a usable `message`, so prefer it over a generic string.
 */
function backendMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as
      | { message?: string; errors?: Array<{ msg?: string }> }
      | undefined;
    if (data?.message) return data.message;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.msg).filter(Boolean).join(', ');
    }
  }
  return fallback;
}

export const useCreateIntent = (
  options?: Omit<
    UseMutationOptions<Intent, Error, CreateIntentInput>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<Intent, Error, CreateIntentInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post<Intent>(api.intents.create, data);
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['intents'] });
      toast.success('Intent shop created successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(backendMessage(error, 'Failed to create intent shop'));
      options?.onError?.(error, variables, context);
    },
  });
};

export const useUpdateIntent = (
  options?: Omit<
    UseMutationOptions<Intent, Error, { id: string; data: UpdateIntentInput }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<Intent, Error, { id: string; data: UpdateIntentInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<Intent>(api.intents.update(id), data);
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['intents'] });
      queryClient.invalidateQueries({ queryKey: ['intent', variables.id] });
      toast.success('Intent shop updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(backendMessage(error, 'Failed to update intent shop'));
      options?.onError?.(error, variables, context);
    },
  });
};

export const useDeleteIntent = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(api.intents.delete(id));
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['intents'] });
      toast.success('Intent shop deleted successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(backendMessage(error, 'Failed to delete intent shop'));
      options?.onError?.(error, variables, context);
    },
  });
};

/**
 * Publish / unpublish. Only `active` intents are exposed by the storefront and
 * listed in the sitemap, so this is the switch that puts a page live on Google.
 */
export const useToggleIntentStatus = (
  options?: Omit<
    UseMutationOptions<Intent, Error, { id: string; status: IntentStatus }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<Intent, Error, { id: string; status: IntentStatus }>({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch<Intent>(
        api.intents.toggleStatus(id),
        { status }
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['intents'] });
      queryClient.invalidateQueries({ queryKey: ['intent', variables.id] });
      toast.success(
        variables.status === 'active'
          ? 'Intent shop published'
          : `Intent shop set to ${variables.status}`
      );
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(backendMessage(error, 'Failed to update status'));
      options?.onError?.(error, variables, context);
    },
  });
};
