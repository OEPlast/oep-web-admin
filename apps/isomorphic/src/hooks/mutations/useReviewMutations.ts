/**
 * React Query Mutation Hooks for Review Management
 * All POST/PUT/PATCH/DELETE operations for reviews
 */

'use client';

import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import {
  Review,
  ModerateReviewInput,
  BulkModerateInput,
  AddReplyInput,
  UpdateReplyInput,
  CreateReviewInput,
  UpdateReviewInput,
} from '@/types/review.types';
import { reviewKeys } from '../queries/useReviews';

// Mutation Context Types
type MutationContext = {
  previousReviews?: any;
  previousReview?: Review;
};

/**
 * Create a new review (admin creation)
 */
export const useCreateReview = (
  options?: Omit<
    UseMutationOptions<Review, Error, CreateReviewInput, MutationContext>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, CreateReviewInput, MutationContext>({
    mutationFn: async (data: CreateReviewInput) => {
      const response = await apiClient.post<Review>('/', data);
      if (!response.data) {
        throw new Error('Failed to create review');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate all review lists
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.statistics() });
      toast.success('Review created successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Create review error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Update an existing review
 */
export const useUpdateReview = (
  options?: Omit<
    UseMutationOptions<
      Review,
      Error,
      { id: string; data: UpdateReviewInput },
      MutationContext
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Review,
    Error,
    { id: string; data: UpdateReviewInput },
    MutationContext
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<Review>(
        api.reviews.update(id),
        data
      );
      if (!response.data) {
        throw new Error('Failed to update review');
      }
      return response.data;
    },
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: reviewKeys.detail(id) });

      // Snapshot previous value
      const previousReview = queryClient.getQueryData<Review>(
        reviewKeys.detail(id)
      );

      return { previousReview };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specific review and lists
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.statistics() });
      toast.success('Review updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousReview) {
        queryClient.setQueryData(
          reviewKeys.detail(variables.id),
          context.previousReview
        );
      }
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Update review error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Delete a review
 */
export const useDeleteReview = (
  options?: Omit<
    UseMutationOptions<void, Error, string, MutationContext>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, MutationContext>({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.reviews.delete(id));
    },
    onSuccess: (data, reviewId, context) => {
      // Invalidate all review queries
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.removeQueries({ queryKey: reviewKeys.detail(reviewId) });
      toast.success('Review deleted successfully');
      options?.onSuccess?.(data, reviewId, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Delete review error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Moderate a single review (approve/reject)
 */
export const useModerateReview = (
  options?: Omit<
    UseMutationOptions<
      Review,
      Error,
      { id: string; data: ModerateReviewInput },
      MutationContext
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    Review,
    Error,
    { id: string; data: ModerateReviewInput },
    MutationContext
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<Review>(
        api.reviews.moderate(id),
        data
      );
      if (!response.data) {
        throw new Error('Failed to moderate review');
      }
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate review cache
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.statistics() });

      const action =
        variables.data.action === 'approve' ? 'approved' : 'rejected';
      toast.success(`Review ${action} successfully`);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Moderate review error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Add a reply to a review
 */
export const useAddReply = (
  options?: Omit<
    UseMutationOptions<
      null,
      Error,
      { reviewId: string; data: AddReplyInput },
      MutationContext
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    null,
    Error,
    { reviewId: string; data: AddReplyInput },
    MutationContext
  >({
    mutationFn: async ({ reviewId, data }) => {
      const response = await apiClient.post<null>(
        api.reviews.addReply(reviewId),
        data
      );
      // The reply endpoints answer { message, data: null }; a 2xx is the success signal.
      return response.data ?? null;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate review
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.reviewId),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.statistics() });
      toast.success('Reply added successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Add reply error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Update a reply
 */
export const useUpdateReply = (
  options?: Omit<
    UseMutationOptions<
      null,
      Error,
      { reviewId: string; replyId: string; data: UpdateReplyInput },
      MutationContext
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    null,
    Error,
    { reviewId: string; replyId: string; data: UpdateReplyInput },
    MutationContext
  >({
    mutationFn: async ({ reviewId, replyId, data }) => {
      const response = await apiClient.put<null>(
        api.reviews.updateReply(reviewId, replyId),
        data
      );
      // The reply endpoints answer { message, data: null }; a 2xx is the success signal.
      return response.data ?? null;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate review
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.reviewId),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      toast.success('Reply updated successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Update reply error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * Delete a reply
 */
export const useDeleteReply = (
  options?: Omit<
    UseMutationOptions<
      null,
      Error,
      { reviewId: string; replyId: string },
      MutationContext
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<
    null,
    Error,
    { reviewId: string; replyId: string },
    MutationContext
  >({
    mutationFn: async ({ reviewId, replyId }) => {
      const response = await apiClient.delete<null>(
        api.reviews.deleteReply(reviewId, replyId)
      );
      // The reply endpoints answer { message, data: null }; a 2xx is the success signal.
      return response.data ?? null;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate review
      queryClient.invalidateQueries({
        queryKey: reviewKeys.detail(variables.reviewId),
      });
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.statistics() });
      toast.success('Reply deleted successfully');
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      console.error('Delete reply error:', error);
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

const reviewMutationsHook = {
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useModerateReview,
  useAddReply,
  useUpdateReply,
  useDeleteReply,
};
export default reviewMutationsHook;
