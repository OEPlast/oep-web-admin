import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import type { OrderStatus } from '@/types/order.types';
import { toast } from 'react-hot-toast';

/**
 * Order mutations, matched to the routes Main-server serves (routes/admin/order.ts).
 *
 * The previous hooks called eight endpoints that did not exist (`/status`, `/tracking`, `/refund`
 * …), so no order action in the admin has ever worked. Cancel and reject are DELETEs with a JSON
 * body, which axios sends through `config.data`.
 */

type MutationResult = { message?: string };

const invalidateOrder = (queryClient: ReturnType<typeof useQueryClient>, orderId: string) => {
  queryClient.invalidateQueries({ queryKey: ['orders'] });
  queryClient.invalidateQueries({ queryKey: ['order', orderId] });
  queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
  queryClient.invalidateQueries({ queryKey: ['transactions'] });
  queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
};

export interface UpdateOrderStatusInput {
  /** Backend statuses, capitalised. Allowed moves: Pending→Processing/Cancelled/Failed, Processing→Completed/Cancelled. */
  status: OrderStatus;
}

export function useUpdateOrderStatus(
  options?: UseMutationOptions<MutationResult, Error, { orderId: string; data: UpdateOrderStatusInput }>
) {
  const queryClient = useQueryClient();
  return useMutation<MutationResult, Error, { orderId: string; data: UpdateOrderStatusInput }>({
    mutationFn: async ({ orderId, data }) => {
      const response = await apiClient.put<MutationResult>(api.orders.update(orderId), data);
      return { message: response.message };
    },
    onSuccess: (data, variables, context) => {
      invalidateOrder(queryClient, variables.orderId);
      toast.success(data.message || 'Order updated');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(handleApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
}

export interface CancelOrderInput {
  /** Shown to the customer in the cancellation email. */
  reason?: string;
}

/** Cancels the order: stock and coupons are released, and a paid order is refunded via Paystack. */
export function useCancelOrder(
  options?: UseMutationOptions<MutationResult, Error, { orderId: string; data: CancelOrderInput }>
) {
  const queryClient = useQueryClient();
  return useMutation<MutationResult, Error, { orderId: string; data: CancelOrderInput }>({
    mutationFn: async ({ orderId, data }) => {
      const response = await apiClient.delete<MutationResult>(api.orders.cancel(orderId), { data });
      return { message: response.message };
    },
    onSuccess: (data, variables, context) => {
      invalidateOrder(queryClient, variables.orderId);
      toast.success(data.message || 'Order cancelled');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(handleApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
}

/** Rejects (cancels) the order with a default "we could not fulfil this order" reason unless one is given. */
export function useRejectOrder(
  options?: UseMutationOptions<MutationResult, Error, { orderId: string; data: CancelOrderInput }>
) {
  const queryClient = useQueryClient();
  return useMutation<MutationResult, Error, { orderId: string; data: CancelOrderInput }>({
    mutationFn: async ({ orderId, data }) => {
      const response = await apiClient.delete<MutationResult>(api.orders.reject(orderId), { data });
      return { message: response.message };
    },
    onSuccess: (data, variables, context) => {
      invalidateOrder(queryClient, variables.orderId);
      toast.success(data.message || 'Order rejected');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(handleApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
}

export function useUpdateDeliveryTimeline(
  options?: UseMutationOptions<MutationResult, Error, { orderId: string; data: { timeline: string } }>
) {
  const queryClient = useQueryClient();
  return useMutation<MutationResult, Error, { orderId: string; data: { timeline: string } }>({
    mutationFn: async ({ orderId, data }) => {
      const response = await apiClient.patch<MutationResult>(api.orders.deliveryTimeline(orderId), data);
      return { message: response.message };
    },
    onSuccess: (data, variables, context) => {
      invalidateOrder(queryClient, variables.orderId);
      toast.success(data.message || 'Delivery timeline updated');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(handleApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
}
