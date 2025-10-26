/**
 * React Query Hooks for Transaction Mutations
 * All POST/PUT/DELETE operations for transactions
 */

'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import { transactionKeys } from '@/hooks/queries/useTransactions';
import {
  Transaction,
  RefundRequest,
  TransactionResponse,
} from '@/types/transaction.types';

/**
 * Process refund for a transaction
 */
export const useProcessRefund = (
  options?: Omit<
    UseMutationOptions<
      Transaction,
      Error,
      { transactionId: string; refundData: RefundRequest },
      { previousTransaction?: Transaction }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Transaction,
    Error,
    { transactionId: string; refundData: RefundRequest },
    { previousTransaction?: Transaction }
  >({
    mutationFn: async ({ transactionId, refundData }) => {
      const response = await apiClient.post<TransactionResponse>(
        api.transactions.refund(transactionId),
        refundData
      );

      if (!response.data?.data) {
        throw new Error('Failed to process refund');
      }

      return response.data.data;
    },
    onMutate: async ({ transactionId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: transactionKeys.detail(transactionId),
      });

      // Snapshot previous value
      const previousTransaction = queryClient.getQueryData<Transaction>(
        transactionKeys.detail(transactionId)
      );

      return { previousTransaction };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.transactionId),
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.statistics() });

      toast.success('Refund processed successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTransaction) {
        queryClient.setQueryData(
          transactionKeys.detail(variables.transactionId),
          context.previousTransaction
        );
      }

      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Process refund error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};
