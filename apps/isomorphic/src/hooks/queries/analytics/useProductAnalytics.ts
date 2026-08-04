'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type { ProductAnalyticsResponse } from '@/types/analytics-product.types';
import type { AnalyticsRange } from '@/types/analytics-query.types';

/**
 * Everything about one product.
 *
 * Named `useProductAnalytics`, not `useProductPerformance` — that name is
 * already the *table* hook in `useAnalyticsTables`, which lists many products.
 * One returns a page's worth of detail about one product; the other returns one
 * row about many.
 */
export const useProductAnalytics = (
  productId: string | null,
  range: AnalyticsRange & { granularity?: string }
) => {
  const search = new URLSearchParams();
  if (range.from) search.set('from', range.from);
  if (range.to) search.set('to', range.to);
  if (range.granularity) search.set('granularity', range.granularity);
  const qs = search.toString();

  return useQuery<ProductAnalyticsResponse, Error>({
    queryKey: ['analytics', 'product-performance', productId, qs],
    queryFn: async () => {
      const response = await apiClient.get<ProductAnalyticsResponse>(
        `${api.analytics.productAnalytics(productId as string)}?${qs}`
      );

      // The endpoint always returns a body on 200, zero-filled for a quiet
      // window, so an absent one means the contract broke rather than that the
      // product had no activity.
      if (!response.data) {
        throw new Error('Product performance returned no body — expected a result object.');
      }
      return response.data;
    },
    // No product chosen yet: the page shows the SKU prompt instead of querying.
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000,
  });
};
