'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

interface SlugAvailabilityResponse {
  available: boolean;
}

export const useCheckCampaignSlug = (slug: string, excludeId?: string) => {
  return useQuery<SlugAvailabilityResponse>({
    queryKey: ['campaign', 'slug-availability', slug, excludeId],
    queryFn: async () => {
      const response = await apiClient.get<SlugAvailabilityResponse>(
        api.campaigns.checkSlug(slug, excludeId)
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    enabled: !!slug && slug.length >= 3,
    staleTime: 0,
  });
};
