/**
 * React Query Hooks for Review Queries
 * All GET operations for reviews
 */

'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import {
  Review,
  PaginatedReviews,
  ReviewFilters,
  ReviewStatistics,
  MoodAnalytics,
  MinimalProduct,
  UserSearchResult,
} from '@/types/review.types';

// Query Keys (for cache management)
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: ReviewFilters) => [...reviewKeys.lists(), filters] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  byProduct: (productId: string, filters?: ReviewFilters) =>
    [...reviewKeys.all, 'by-product', productId, filters] as const,
  byUser: (userId: string, filters?: ReviewFilters) =>
    [...reviewKeys.all, 'by-user', userId, filters] as const,
  statistics: () => [...reviewKeys.all, 'statistics'] as const,
  moodAnalytics: () => [...reviewKeys.all, 'mood-analytics'] as const,
  products: () => ['products', 'minimal'] as const,
  userSearch: (query: string) => ['users', 'search', query] as const,
};

/**
 * Fetch all reviews with pagination and filters
 */
export const useReviews = (
  filters: ReviewFilters = {},
  options?: Omit<
    UseQueryOptions<PaginatedReviews, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedReviews, Error>({
    queryKey: reviewKeys.list(filters),
    queryFn: async () => {
      // Prepare query params - convert isApproved to backend format
      const params: Record<string, any> = { ...filters };
      
      // Backend expects isApproved as 'true' or 'false' string, or omitted for all
      if (params.isApproved === 'all' || params.isApproved === undefined) {
        delete params.isApproved;
      } else if (typeof params.isApproved === 'boolean') {
        params.isApproved = params.isApproved ? 'true' : 'false';
      }
      
      const response = await apiClient.get<PaginatedReviews>(api.reviews.list, {
        params,
      });
      if (!response.data) {
        throw new Error('No data returned from reviews API');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reviews change frequently)
    retry: 2,
    ...options,
  });
};

/**
 * Fetch single review by ID
 */
export const useReviewById = (
  id: string,
  options?: Omit<UseQueryOptions<Review, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Review, Error>({
    queryKey: reviewKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Review>(api.reviews.byId(id));
      if (!response.data) {
        throw new Error('Review not found');
      }
      return response.data;
    },
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Fetch reviews by product ID
 */
export const useProductReviews = (
  productId: string,
  filters: ReviewFilters = {},
  options?: Omit<
    UseQueryOptions<PaginatedReviews, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedReviews, Error>({
    queryKey: reviewKeys.byProduct(productId, filters),
    queryFn: async () => {
      // Prepare query params - convert isApproved to backend format
      const params: Record<string, any> = { ...filters };
      
      // Backend expects isApproved as 'true' or 'false' string, or omitted for all
      if (params.isApproved === 'all' || params.isApproved === undefined) {
        delete params.isApproved;
      } else if (typeof params.isApproved === 'boolean') {
        params.isApproved = params.isApproved ? 'true' : 'false';
      }
      
      const response = await apiClient.get<PaginatedReviews>(
        api.reviews.byProduct(productId),
        {
          params,
        }
      );
      if (!response.data) {
        throw new Error('No reviews found for this product');
      }
      return response.data;
    },
    enabled: !!productId, // Only run if productId exists
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Fetch reviews by user ID
 */
export const useUserReviews = (
  userId: string,
  filters: ReviewFilters = {},
  options?: Omit<
    UseQueryOptions<PaginatedReviews, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedReviews, Error>({
    queryKey: reviewKeys.byUser(userId, filters),
    queryFn: async () => {
      // Prepare query params - convert isApproved to backend format
      const params: Record<string, any> = { ...filters };
      
      // Backend expects isApproved as 'true' or 'false' string, or omitted for all
      if (params.isApproved === 'all' || params.isApproved === undefined) {
        delete params.isApproved;
      } else if (typeof params.isApproved === 'boolean') {
        params.isApproved = params.isApproved ? 'true' : 'false';
      }
      
      const response = await apiClient.get<PaginatedReviews>(
        api.reviews.byUser(userId),
        {
          params,
        }
      );
      if (!response.data) {
        throw new Error('No reviews found for this user');
      }
      return response.data;
    },
    enabled: !!userId, // Only run if userId exists
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Fetch review statistics
 */
export const useReviewStatistics = (
  options?: Omit<UseQueryOptions<ReviewStatistics, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ReviewStatistics, Error>({
    queryKey: reviewKeys.statistics(),
    queryFn: async () => {
      const response = await apiClient.get<ReviewStatistics>(
        api.reviews.statistics
      );
      if (!response.data) {
        throw new Error('Failed to fetch review statistics');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (stats don't change rapidly)
    refetchOnMount: true,
    ...options,
  });
};

/**
 * Fetch mood analytics (sentiment analysis)
 */
export const useMoodAnalytics = (
  options?: Omit<UseQueryOptions<MoodAnalytics, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<MoodAnalytics, Error>({
    queryKey: reviewKeys.moodAnalytics(),
    queryFn: async () => {
      const response = await apiClient.get<MoodAnalytics>(
        api.reviews.moodAnalytics
      );
      if (!response.data) {
        throw new Error('Failed to fetch mood analytics');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (analytics are computationally expensive)
    ...options,
  });
};

/**
 * Fetch minimal product list for dropdowns
 * Uses the new list-minimal endpoint
 */
export const useProducts = (
  options?: Omit<UseQueryOptions<MinimalProduct[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<MinimalProduct[], Error>({
    queryKey: reviewKeys.products(),
    queryFn: async () => {
      const response = await apiClient.get<MinimalProduct[]>(
        api.products.listMinimal
      );
      if (!response.data) {
        throw new Error('Failed to fetch products');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (product list changes infrequently)
    ...options,
  });
};

/**
 * Search users for autocomplete
 * Uses the new user search endpoint
 */
export const useUserSearch = (
  query: string,
  options?: Omit<
    UseQueryOptions<UserSearchResult[], Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<UserSearchResult[], Error>({
    queryKey: reviewKeys.userSearch(query),
    queryFn: async () => {
      const response = await apiClient.get<UserSearchResult[]>(
        api.users.search,
        {
          params: { q: query },
        }
      );
      if (!response.data) {
        throw new Error('No users found');
      }
      return response.data;
    },
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30 * 1000, // 30 seconds (search results can change quickly)
    retry: 1, // Don't retry search queries aggressively
    ...options,
  });
};

// Export all hooks as default for convenience
export default {
  useReviews,
  useReviewById,
  useProductReviews,
  useUserReviews,
  useReviewStatistics,
  useMoodAnalytics,
  useProducts,
  useUserSearch,
};
