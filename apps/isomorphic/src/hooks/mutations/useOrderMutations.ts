import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type {
  Order,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  UpdateTrackingInput,
  ProcessRefundInput,
  CancelOrderInput,
  UpdateNotesInput,
} from '@/types/order.types';
import { toast } from 'react-hot-toast';

// Update Order Status
export function useUpdateOrderStatus(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdateOrderStatusInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateOrderStatusInput;
    }) => {
      const response = await apiClient.put(api.orders.updateStatus(orderId), data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
      toast.success('Order status updated successfully');
      options?.onSuccess?.(data, variables, {} as any);
    },
    onError: (error, variables) => {
      toast.error('Failed to update order status');
      options?.onError?.(error, variables, {} as any);
    },
  });
}

// Update Payment Status
export function useUpdatePaymentStatus(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdatePaymentStatusInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdatePaymentStatusInput;
    }) => {
      const response = await apiClient.put(
        api.orders.updatePaymentStatus(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Payment status updated successfully');
      options?.onSuccess?.(data, variables, {} as any);
    },
    onError: (error, variables) => {
      toast.error('Failed to update payment status');
      options?.onError?.(error, variables, {} as any);
    },
  });
}

// Update Tracking Information
export function useUpdateTracking(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdateTrackingInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateTrackingInput;
    }) => {
      const response = await apiClient.put(
        api.orders.updateTracking(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Tracking information updated successfully');
      options?.onSuccess?.(data, variables, {} as any);
    },
    onError: (error, variables) => {
      toast.error('Failed to update tracking information');
      options?.onError?.(error, variables, {} as any);
    },
  });
}

// Process Refund
export function useProcessRefund(
  options?: UseMutationOptions<
    { success: boolean; data: Order; refundTransaction: any },
    Error,
    { orderId: string; data: ProcessRefundInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: ProcessRefundInput;
    }) => {
      const response = await apiClient.post(api.orders.refund(orderId), data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
      toast.success('Refund processed successfully');
      options?.onSuccess?.(data, variables, {} as any);
    },
    onError: (error, variables) => {
      toast.error('Failed to process refund');
      options?.onError?.(error, variables, {} as any);
    },
  });
}

// Cancel Order
export function useCancelOrder(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: CancelOrderInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: CancelOrderInput;
    }) => {
      const response = await apiClient.put(api.orders.cancel(orderId), data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
      toast.success('Order cancelled successfully');
      options?.onSuccess?.(data, variables, {} as any);
    },
    onError: (error, variables) => {
      toast.error('Failed to cancel order');
      options?.onError?.(error, variables, {} as any);
    },
  });
}

// Update Internal Notes
export function useUpdateOrderNotes(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdateNotesInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string;
      data: UpdateNotesInput;
    }) => {
      const response = await apiClient.put(api.orders.updateNotes(orderId), data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Notes updated successfully');
      options?.onSuccess?.(data, variables, {} as any);
    },
    onError: (error, variables) => {
      toast.error('Failed to update notes');
      options?.onError?.(error, variables, {} as any);
    },
  });
}
