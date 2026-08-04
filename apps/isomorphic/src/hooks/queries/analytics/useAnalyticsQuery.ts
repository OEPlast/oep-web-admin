'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import type {
  AnalyticsMetaResponse,
  BreakdownParams,
  BreakdownResponse,
  SeriesParams,
  SeriesResponse,
  SummaryParams,
  SummaryResponse,
} from '@/types/analytics-query.types';

/**
 * Query-engine hooks.
 *
 * Two deliberate differences from the legacy analytics hooks:
 *
 * 1. **No `if (!response.data) throw`.** Every legacy hook carries that guard, so
 *    a date range with no activity surfaced as a React Query *error* — and no
 *    analytics page renders an error state, so it showed as a permanently
 *    loading or empty widget with no explanation. The engine returns a
 *    zero-filled body for empty windows, so there is nothing to guard against.
 *
 * 2. **Range params are serialised into the query key**, not the whole params
 *    object by reference. The legacy pages build `dateParams` as a fresh object
 *    literal every render; React Query's structural hashing coped, but the key
 *    is clearer and cheaper when it is a stable string.
 */

/**
 * Assert the engine returned a body.
 *
 * Superficially this is the same `if (!data) throw` the legacy hooks use, but it
 * means the opposite thing. There, a range with genuinely no activity came back
 * `null` and became a query error — an empty week looked like a failure. The
 * engine always returns a body on a 200, zero-filled when there is nothing to
 * report, so reaching this branch means the server broke its contract and an
 * error is the right response.
 */
const unwrap = <T>(data: T | null, what: string): T => {
  if (data === null || data === undefined) {
    throw new Error(`Analytics ${what} returned no body — expected a result object.`);
  }
  return data;
};

const buildRangeParams = (
  params: { preset?: string; from?: string; to?: string; tz?: string },
  search: URLSearchParams
) => {
  // preset and from/to are mutually exclusive server-side; prefer the preset
  // when both are somehow present so the request stays valid.
  if (params.preset) {
    search.set('preset', params.preset);
  } else {
    if (params.from) search.set('from', params.from);
    if (params.to) search.set('to', params.to);
  }
  if (params.tz) search.set('tz', params.tz);
};

export const useSeries = (
  params: SeriesParams,
  options?: Omit<UseQueryOptions<SeriesResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  const search = new URLSearchParams();
  search.set('metrics', params.metrics.join(','));
  buildRangeParams(params, search);
  if (params.granularity) search.set('granularity', params.granularity);
  if (params.compare) search.set('compare', params.compare);
  if (params.dimension) search.set('dimension', params.dimension);

  const qs = search.toString();

  return useQuery<SeriesResponse, Error>({
    queryKey: ['analytics', 'series', qs],
    queryFn: async () => {
      const response = await apiClient.get<SeriesResponse>(`${api.analytics.series}?${qs}`);
      return unwrap(response.data, 'series');
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useSummary = (
  params: SummaryParams,
  options?: Omit<UseQueryOptions<SummaryResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  const search = new URLSearchParams();
  search.set('metrics', params.metrics.join(','));
  buildRangeParams(params, search);
  if (params.compare) search.set('compare', params.compare);

  const qs = search.toString();

  return useQuery<SummaryResponse, Error>({
    queryKey: ['analytics', 'summary', qs],
    queryFn: async () => {
      const response = await apiClient.get<SummaryResponse>(`${api.analytics.summary}?${qs}`);
      return unwrap(response.data, 'summary');
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useBreakdown = (
  params: BreakdownParams,
  options?: Omit<UseQueryOptions<BreakdownResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  const search = new URLSearchParams();
  search.set('metric', params.metric);
  search.set('dimension', params.dimension);
  buildRangeParams(params, search);
  if (params.limit) search.set('limit', String(params.limit));

  const qs = search.toString();

  return useQuery<BreakdownResponse, Error>({
    queryKey: ['analytics', 'breakdown', qs],
    queryFn: async () => {
      const response = await apiClient.get<BreakdownResponse>(`${api.analytics.breakdown}?${qs}`);
      return unwrap(response.data, 'breakdown');
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * The metric registry, as data.
 *
 * Long-lived: the registry only changes on deploy, so refetching it per page
 * would be pure waste. Useful for metric pickers, and for showing which
 * timestamp a figure is measured on next to the figure itself.
 */
export const useAnalyticsMeta = (
  options?: Omit<UseQueryOptions<AnalyticsMetaResponse, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<AnalyticsMetaResponse, Error>({
    queryKey: ['analytics', 'meta'],
    queryFn: async () => {
      const response = await apiClient.get<AnalyticsMetaResponse>(api.analytics.meta);
      return unwrap(response.data, 'meta');
    },
    staleTime: 60 * 60 * 1000,
    ...options,
  });
