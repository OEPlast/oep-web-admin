'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

export interface StoreSettings {
  _id: string;
  storeName: string;
  companyName: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
  supportPhone: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  taxId: string;
  taxRate: number;
  currency: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    x?: string;
    threads?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useStoreSettings(
  options?: Omit<UseQueryOptions<StoreSettings, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<StoreSettings, Error>({
    queryKey: ['storeSettings'],
    queryFn: async () => {
      const response = await apiClient.get<StoreSettings>(api.settings.get);
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - settings don't change often
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });
}
