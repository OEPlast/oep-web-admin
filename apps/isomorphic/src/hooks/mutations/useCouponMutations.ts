import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import {
  CouponDataType,
  CreateCouponInput,
  UpdateCouponInput,
} from '@/data/coupon-data';
import { toast } from 'react-hot-toast';

type MutationContext = {
  previousCoupons?: CouponDataType[];
};

// Create coupon mutation
export function useCreateCoupon(
  options?: Omit<
    UseMutationOptions<
      CouponDataType,
      Error,
      CreateCouponInput,
      MutationContext
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<CouponDataType, Error, CreateCouponInput, MutationContext>(
    {
      mutationFn: async (data: CreateCouponInput) => {
        const response = await apiClient.post<CouponDataType>(
          api.coupons.create,
          data
        );

        if (!response.data) {
          throw new Error('Failed to create coupon');
        }

        return response.data;
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ['coupons'] });
        toast.success('Coupon created successfully');
        options?.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        const errorMessage = handleApiError(error);
        toast.error(errorMessage);
        options?.onError?.(error, variables, context);
      },
      ...options,
    }
  );
}

// Update coupon mutation
export function useUpdateCoupon(
  options?: Omit<
    UseMutationOptions<
      CouponDataType,
      Error,
      { id: string; data: UpdateCouponInput },
      MutationContext
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    CouponDataType,
    Error,
    { id: string; data: UpdateCouponInput },
    MutationContext
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put<CouponDataType>(
        api.coupons.update(id),
        data
      );

      if (!response.data) {
        throw new Error('Failed to update coupon');
      }

      return response.data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon', variables.id] });
      toast.success('Coupon updated successfully');
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

// Delete coupon mutation
export function useDeleteCoupon(
  options?: Omit<
    UseMutationOptions<void, Error, string, MutationContext>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.coupons.delete(id));
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon', variables] });
      toast.success('Coupon deleted successfully');
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
