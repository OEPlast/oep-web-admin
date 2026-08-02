'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { Intent, IntentFilters } from '@/data/intents-data';

interface IntentsResponse {
  intents: Intent[];
  total: number;
}

/**
 * List intent shops for the admin table.
 * The set is curated and small, so the backend returns it unpaginated.
 */
export const useIntents = (filters?: IntentFilters) => {
  return useQuery<IntentsResponse>({
    queryKey: ['intents', 'all', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);

      const response = await apiClient.get<IntentsResponse>(
        `${api.intents.all}?${params.toString()}`
      );

      if (!response.data) {
        throw new Error('No data returned');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get a single intent shop by id (for the edit form).
 */
export const useIntent = (id: string) => {
  return useQuery<Intent>({
    queryKey: ['intent', id],
    queryFn: async () => {
      const response = await apiClient.get<Intent>(api.intents.byId(id));

      if (!response.data) {
        throw new Error('No data returned');
      }

      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Slug availability check. Disabled until a slug is actually entered so the
 * form does not fire a request on every keystroke of an empty field.
 */
export const useIntentSlugAvailability = (slug: string, excludeId?: string) => {
  return useQuery<{ available: boolean }>({
    queryKey: ['intent', 'slug', slug, excludeId],
    queryFn: async () => {
      const response = await apiClient.get<{ available: boolean }>(
        api.intents.checkSlug(slug, excludeId)
      );

      if (!response.data) {
        throw new Error('No data returned');
      }

      return response.data;
    },
    enabled: !!slug && slug.length > 2,
    staleTime: 30 * 1000,
  });
};
