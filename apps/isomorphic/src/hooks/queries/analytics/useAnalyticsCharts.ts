/**
 * Analytics Chart Hooks (14 hooks)
 * 
 * React Query hooks for fetching chart-ready analytics data.
 * All hooks return flat arrays optimized for Recharts components.
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type {
  RevenueExpenseChartData,
  ProfitLossChartData,
  OrdersTrendData,
  TransactionsTrendData,
  CustomerAcquisitionData,
  OrderStatusDistributionData,
  TransactionStatusDistributionData,
  RatingDistributionData,
  ReviewSentimentData,
  CouponRedemptionTrendData,
  PaymentMethodsData,
  TopProductsRevenueData,
  CategoriesPerformanceData,
  UserDemographicsData,
  CouponTypeDistributionData,
  ChartParams,
  TopItemsParams,
} from '@/types/analytics.types';

/**
 * Hook: useRevenueExpenseChart
 * Get revenue vs expense time-series data for Area/Line charts
 */
export const useRevenueExpenseChart = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<RevenueExpenseChartData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<RevenueExpenseChartData[], Error>({
    queryKey: ['analytics', 'revenue-expense-chart', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<RevenueExpenseChartData[]>(
        `${api.analytics.revenueExpenseChart}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useProfitLossChart
 * Get profit/loss breakdown time-series data (revenue, expenses, returns)
 */
export const useProfitLossChart = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<ProfitLossChartData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProfitLossChartData[], Error>({
    queryKey: ['analytics', 'profit-loss-chart', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<ProfitLossChartData[]>(
        `${api.analytics.profitLossChart}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useOrdersTrend
 * Get orders trend time-series data
 */
export const useOrdersTrend = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<OrdersTrendData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<OrdersTrendData[], Error>({
    queryKey: ['analytics', 'orders-trend', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<OrdersTrendData[]>(
        `${api.analytics.ordersTrend}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useTransactionsTrend
 * Get transactions trend time-series data
 */
export const useTransactionsTrend = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<TransactionsTrendData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TransactionsTrendData[], Error>({
    queryKey: ['analytics', 'transactions-trend', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<TransactionsTrendData[]>(
        `${api.analytics.transactionsTrend}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useCustomerAcquisition
 * Get new customer registrations time-series data
 */
export const useCustomerAcquisition = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<CustomerAcquisitionData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CustomerAcquisitionData[], Error>({
    queryKey: ['analytics', 'customer-acquisition', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<CustomerAcquisitionData[]>(
        `${api.analytics.customerAcquisition}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useOrderStatusDistribution
 * Get order count by status for Pie charts
 */
export const useOrderStatusDistribution = (
  params: { from: string; to: string },
  options?: Omit<UseQueryOptions<OrderStatusDistributionData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<OrderStatusDistributionData[], Error>({
    queryKey: ['analytics', 'order-status-distribution', params],
    queryFn: async () => {
      const response = await apiClient.get<OrderStatusDistributionData[]>(
        `${api.analytics.orderStatusDistribution}?from=${params.from}&to=${params.to}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useTransactionStatusDistribution
 * Get transaction status distribution over time for Bar charts
 */
export const useTransactionStatusDistribution = (
  params: { from: string; to: string; groupBy?: 'days' | 'months' | 'years' },
  options?: Omit<UseQueryOptions<TransactionStatusDistributionData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TransactionStatusDistributionData[], Error>({
    queryKey: ['analytics', 'transaction-status-distribution', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        ...(params.groupBy && { groupBy: params.groupBy }),
      });
      const response = await apiClient.get<TransactionStatusDistributionData[]>(
        `${api.analytics.transactionStatusDistribution}?${queryParams.toString()}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useRatingDistribution
 * Get review count by star rating (1-5) for Bar charts
 */
export const useRatingDistribution = (
  params: { from: string; to: string },
  options?: Omit<UseQueryOptions<RatingDistributionData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<RatingDistributionData[], Error>({
    queryKey: ['analytics', 'rating-distribution', params],
    queryFn: async () => {
      const response = await apiClient.get<RatingDistributionData[]>(
        `${api.analytics.ratingDistribution}?from=${params.from}&to=${params.to}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useReviewSentiment
 * Get positive/negative review trends over time
 */
export const useReviewSentiment = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<ReviewSentimentData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ReviewSentimentData[], Error>({
    queryKey: ['analytics', 'review-sentiment', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<ReviewSentimentData[]>(
        `${api.analytics.reviewSentiment}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useCouponRedemptionTrend
 * Get coupon usage trends over time
 */
export const useCouponRedemptionTrend = (
  params: ChartParams,
  options?: Omit<UseQueryOptions<CouponRedemptionTrendData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CouponRedemptionTrendData[], Error>({
    queryKey: ['analytics', 'coupon-redemption-trend', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        groupBy: params.groupBy || 'months',
      });
      const response = await apiClient.get<CouponRedemptionTrendData[]>(
        `${api.analytics.couponRedemptionTrend}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: usePaymentMethods
 * Get transaction count by payment method for Pie charts
 */
export const usePaymentMethods = (
  params: { from: string; to: string },
  options?: Omit<UseQueryOptions<PaymentMethodsData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaymentMethodsData[], Error>({
    queryKey: ['analytics', 'payment-methods', params],
    queryFn: async () => {
      const response = await apiClient.get<PaymentMethodsData[]>(
        `${api.analytics.paymentMethods}?from=${params.from}&to=${params.to}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useTopProductsRevenue
 * Get top N products by revenue for Bar charts
 */
export const useTopProductsRevenue = (
  params: TopItemsParams,
  options?: Omit<UseQueryOptions<TopProductsRevenueData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TopProductsRevenueData[], Error>({
    queryKey: ['analytics', 'top-products-revenue', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        limit: (params.limit || 10).toString(),
      });
      const response = await apiClient.get<TopProductsRevenueData[]>(
        `${api.analytics.topProductsRevenue}?${queryParams}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useCategoriesPerformance
 * Get revenue and sales by product category for Bar charts
 */
export const useCategoriesPerformance = (
  params: { from: string; to: string },
  options?: Omit<UseQueryOptions<CategoriesPerformanceData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CategoriesPerformanceData[], Error>({
    queryKey: ['analytics', 'categories-performance', params],
    queryFn: async () => {
      const response = await apiClient.get<CategoriesPerformanceData[]>(
        `${api.analytics.categoriesPerformance}?from=${params.from}&to=${params.to}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useUserDemographics
 * Get user count by country for WorldMap/Pie charts
 */
export const useUserDemographics = (
  params: { from: string; to: string },
  options?: Omit<UseQueryOptions<UserDemographicsData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<UserDemographicsData[], Error>({
    queryKey: ['analytics', 'user-demographics', params],
    queryFn: async () => {
      const response = await apiClient.get<UserDemographicsData[]>(
        `${api.analytics.userDemographics}?from=${params.from}&to=${params.to}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: useCouponTypeDistribution
 * Get coupon usage by type (Percentage/Fixed) for Pie charts
 */
export const useCouponTypeDistribution = (
  params: { from: string; to: string },
  options?: Omit<UseQueryOptions<CouponTypeDistributionData[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<CouponTypeDistributionData[], Error>({
    queryKey: ['analytics', 'coupon-type-distribution', params],
    queryFn: async () => {
      const response = await apiClient.get<CouponTypeDistributionData[]>(
        `${api.analytics.couponTypeDistribution}?from=${params.from}&to=${params.to}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
