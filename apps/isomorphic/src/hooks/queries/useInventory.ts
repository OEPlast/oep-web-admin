'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

export interface InventoryVariant {
  name: string;
  stock: number;
}

export interface InventoryAttribute {
  name: string;
  children: InventoryVariant[];
}

export interface InventoryItem {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  status: 'active' | 'inactive' | 'archived';
  image?: string;
  stock: number;
  lowStockThreshold: number;
  updatedAt?: string;
  attributes?: InventoryAttribute[];
}

export interface InventoryFilters {
  page?: number;
  limit?: number;
  q?: string;
  status?: 'active' | 'inactive' | 'archived';
  /** Only products at or below their low-stock threshold. */
  lowOnly?: boolean;
}

export interface InventoryList {
  products: InventoryItem[];
  total: number;
  page: number;
  limit: number;
}

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (filters: InventoryFilters) => [...inventoryKeys.all, 'list', filters] as const,
};

export function useInventory(filters: InventoryFilters = {}) {
  return useQuery<InventoryList>({
    queryKey: inventoryKeys.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<InventoryList>(api.inventory.list, {
        params: { ...filters, lowOnly: filters.lowOnly ? 'true' : undefined },
      });
      if (!response.data) throw new Error('Invalid inventory response');
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}
