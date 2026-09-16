'use client';

import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import { GIGConfigData } from '../queries/useGIGConfig';

export interface UpdateGIGConfigInput {
  senderName?: string;
  senderPhoneNumber?: string;
  senderAddress?: string;
  senderLocality?: string;
  senderStationId?: number;
  senderLatitude?: number;
  senderLongitude?: number;
  senderCountryCode?: string;
  customerCode?: string;
  customerType?: string;
  vehicleType?: string;
  defaultDeliveryOptionIds?: number[];
  defaultPickUpOptions?: string;
  enabledDeliveryMethods?: Array<'shipping' | 'pickup' | 'gig'>;
  shippingDiscountAmountOff?: number;
  gigDiscountAmountOff?: number;
  freeShippingThreshold?: number | null;
  shippingMinDeliveryDays?: number;
  shippingMaxDeliveryDays?: number;
  isActive?: boolean;
}

type MutationContext = {
  previousConfig?: GIGConfigData;
};

export function useUpdateGIGConfig(
  options?: Omit<
    UseMutationOptions<
      GIGConfigData,
      Error,
      UpdateGIGConfigInput,
      MutationContext
    >,
    'mutationFn'
  >,
  /**
   * `successMessage: null` saves without a toast — for screens that save GIG config as part of a
   * bigger form and report the result once themselves.
   */
  notify: { successMessage?: string | null } = {}
) {
  const queryClient = useQueryClient();

  return useMutation<
    GIGConfigData,
    Error,
    UpdateGIGConfigInput,
    MutationContext
  >({
    mutationFn: async (data: UpdateGIGConfigInput) => {
      const response = await apiClient.put<GIGConfigData>(
        api.gig.updateConfig,
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    // Spread the caller's options FIRST: with them last, a caller passing `onSuccess` replaced
    // these handlers wholesale, so the cached config was never invalidated after a save.
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['gigConfig'] });
      const successMessage =
        notify.successMessage === undefined
          ? 'GIG configuration updated successfully'
          : notify.successMessage;
      if (successMessage) toast.success(successMessage);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Update GIG config error:', error);
      options?.onError?.(error, variables, context);
    },
  });
}
