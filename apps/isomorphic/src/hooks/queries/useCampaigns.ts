'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import {
  Campaign,
  CampaignListItem,
  CampaignFilters,
} from '@/data/campaigns-data';

interface CampaignsListResponse {
  campaigns: CampaignListItem[];
  total: number;
}

interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get campaigns list (minimal data for list view)
 * Uses /admin/campaign/list endpoint
 * No population - only returns counts for better performance
 */
export const useCampaignsList = (filters?: CampaignFilters) => {
  return useQuery<CampaignsListResponse>({
    queryKey: ['campaigns', 'list', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);

      const response = await apiClient.get<CampaignsListResponse>(
        `${api.campaigns.list}?${params.toString()}`
      );

      if (!response.data) {
        throw new Error('No data returned');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get all campaigns (full data with populations)
 * Uses /admin/campaign/all endpoint
 * Returns populated products and sales objects
 */
export const useCampaigns = (filters?: CampaignFilters) => {
  return useQuery<CampaignsResponse>({
    queryKey: ['campaigns', 'all', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);

      const response = await apiClient.get<CampaignsResponse>(
        `${api.campaigns.all}?${params.toString()}`
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
 * Get single campaign by ID (full data with populations)
 */
export const useCampaign = (id: string) => {
  return useQuery<Campaign>({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await apiClient.get<Campaign>(api.campaigns.byId(id));

      if (!response.data) {
        throw new Error('No data returned');
      }

      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
