/**
 * React Query Hooks for Transaction Queries
 * All GET operations for transactions
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import {
  Transaction,
  PaginatedTransactions,
  TransactionFilters,
  TransactionStatistics,
  TransactionsListResponse,
  StatisticsResponse,
  TransactionResponse,
} from '@/types/transaction.types';

// Query Keys (for cache management)
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  statistics: () => [...transactionKeys.all, 'statistics'] as const,
};

/**
 * Fetch all transactions with pagination and filters
 */
export const useTransactions = (
  filters: TransactionFilters = {},
  options?: Omit<
    UseQueryOptions<PaginatedTransactions, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedTransactions, Error>({
    queryKey: transactionKeys.list(filters),
    queryFn: async () => {
      // Use getWithMeta since the API returns { data, message, meta }
      const response = await apiClient.getWithMeta<Transaction[]>(
        api.transactions.list,
        {
          params: filters,
        }
      );
      
      if (!response.data || !response.meta) {
        console.error('Invalid transactions response:', response);
        throw new Error('Invalid response format from transactions API');
      }

      return {
        transactions: response.data,
        pagination: response.meta as any, // Meta contains pagination info
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Fetch a single transaction by ID
 */
export const useTransaction = (
  id: string,
  options?: Omit<UseQueryOptions<Transaction, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Transaction, Error>({
    queryKey: transactionKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Transaction>(
        api.transactions.byId(id)
      );
      
      if (!response.data) {
        throw new Error('Transaction not found');
      }
      
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Fetch transaction statistics
 */
export const useTransactionStatistics = (
  options?: Omit<
    UseQueryOptions<TransactionStatistics, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<TransactionStatistics, Error>({
    queryKey: transactionKeys.statistics(),
    queryFn: async () => {
      const response = await apiClient.get<TransactionStatistics>(
        api.transactions.statistics
      );
      
      if (!response.data) {
        throw new Error('Failed to fetch transaction statistics');
      }
      
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    ...options,
  });
};
