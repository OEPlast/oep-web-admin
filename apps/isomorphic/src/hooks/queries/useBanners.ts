import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { BannerType } from '@/app/shared/ecommerce/banners/banner-types';

export type BannerListParams = {
  page?: number;
  limit?: number;
  name?: string;
  status?: 'active' | 'inactive';
  category?: 'A' | 'B' | 'C' | 'D' | 'E';
};

export type BannerListResponse = {
  items: BannerType[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BannerListMeta = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// Hook to fetch all banners with pagination and filters
export function useBanners(
  params?: BannerListParams,
  options?: Omit<UseQueryOptions<BannerListResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.name) queryParams.append('name', params.name);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.category) queryParams.append('category', params.category);

  const url = `${api.banners.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useQuery<BannerListResponse, Error>({
    queryKey: ['banners', params],
    queryFn: async () => {
      const response = await apiClient.getWithMeta<{ banners: BannerType[] }, BannerListMeta>(url);
      
      return {
        items: response.data?.banners || [],
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 10,
        total: response.meta?.total || 0,
        totalPages: response.meta?.pages || 1,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Hook to fetch a single banner by ID
export function useBanner(
  id: string,
  options?: Omit<UseQueryOptions<BannerType, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<BannerType, Error>({
    queryKey: ['banner', id],
    queryFn: async () => {
      const response = await apiClient.get<BannerType>(api.banners.byId(id));
      
      if (!response.data) {
        throw new Error('Banner not found');
      }
      
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}
