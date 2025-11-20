import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type {
  OrdersListResponse,
  OrderByIdResponse,
  OrderStatisticsResponse,
  OrdersQueryParams,
  Order,
} from '@/types/order.types';

// Fetch orders list with filters
export function useOrders(
  params?: OrdersQueryParams,
  options?: Omit<UseQueryOptions<OrdersListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<OrdersListResponse>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await apiClient.get<OrdersListResponse>(
        api.orders.list,
        {
          params,
        }
      );
      if (!response.data) {
        throw new Error('No data returned from orders API');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

// Fetch single order by ID
export function useOrderById(
  orderId: string,
  options?: Omit<UseQueryOptions<Order>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await apiClient.get<Order>(
        api.orders.byId(orderId)
      );
      if (!response.data) {
        throw new Error('No data returned from order details API');
      }
      return response.data;
    },
    enabled: !!orderId,
    ...options,
  });
}

// Fetch order statistics
export function useOrderStatistics(
  options?: Omit<
    UseQueryOptions<OrderStatisticsResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<OrderStatisticsResponse>({
    queryKey: ['orderStatistics'],
    queryFn: async () => {
      const response = await apiClient.get<OrderStatisticsResponse>(
        api.orders.statistics
      );
      if (!response.data) {
        throw new Error('No data returned from order statistics API');
      }
      return response.data;
    },
    staleTime: 60000, // 1 minute
    ...options,
  });
}
