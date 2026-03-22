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
  >
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
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['gigConfig'] });
      toast.success('GIG configuration updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Update GIG config error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}
