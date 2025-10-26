'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

/**
 * Product interface from API
 */
export interface Product {
  _id: string;
  name: string;
  sku: number;
  slug: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'inactive' | 'archived';
  category: {
    _id: string;
    name: string;
    image?: string;
    slug: string;
  };
  tags?: string[];
  description_images: {
    url: string;
    cover_image: boolean;
  }[];
  specifications?: {
    key: string;
    value: string;
  }[];
  dimension?: {
    key: 'length' | 'breadth' | 'height' | 'volume' | 'width' | 'weight';
    value: string;
  }[];
  shipping?: {
    addedCost: number;
    increaseCostBy: number;
    addedDays: number;
  };
  attributes?: {
    name: string;
    children: {
      name: string;
      price: number;
      stock: number;
      image: string;
      pricingTiers?: Array<{
        minQty: number;
        maxQty?: number;
        strategy: 'fixedPrice' | 'percentOff' | 'amountOff';
        value: number;
      }>;
    }[];
  }[];
  pricingTiers?: Array<{
    minQty: number;
    maxQty?: number;
    strategy: 'fixedPrice' | 'percentOff' | 'amountOff';
    value: number;
  }>;
  totalRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated products response
 */
export interface PaginatedProducts {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Products filters
 */
export interface ProductsFilters {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'rating' | 'sales';
  sortOrder?: 'asc' | 'desc';
  availability?: 'in-stock' | 'out-of-stock' | 'low-stock';
  brand?: string;
  specKey?: string;
  specValue?: string;
}

/**
 * Hook to fetch all products with pagination and filters (enhanced with rating)
 */
export const useProductsEnhanced = (filters?: ProductsFilters) => {
  return useQuery<PaginatedProducts>({
    queryKey: ['products', 'enhanced', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.category) params.append('category', filters.category);
      if (filters?.subcategory) params.append('subcategory', filters.subcategory);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.availability) params.append('availability', filters.availability);
      if (filters?.brand) params.append('brand', filters.brand);
      if (filters?.specKey) params.append('specKey', filters.specKey);
      if (filters?.specValue) params.append('specValue', filters.specValue);

      const response = await apiClient.getWithMeta<Product[], { total: number; page: number; limit: number; pages: number }>(
        `${api.products.listEnhanced}?${params.toString()}`
      );
      
      if (!response.data) {
        throw new Error('No data returned');
      }
      
      return {
        data: response.data,
        meta: response.meta || { total: 0, page: 1, limit: 20, pages: 0 }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
  });
};

/**
 * Hook to check if SKU exists
 */
export const useCheckSku = (sku: string, enabled: boolean = false) => {
  return useQuery<{ exists: boolean; productId?: string; productName?: string }>({
    queryKey: ['product', 'check-sku', sku],
    queryFn: async () => {
      const response = await apiClient.get<{ exists: boolean; productId?: string; productName?: string }>(
        api.products.checkSku(sku)
      );
      return response.data || { exists: false };
    },
    enabled: enabled && !!sku,
    staleTime: 0, // Always fresh
    refetchOnMount: false,
  });
};

/**
 * Hook to fetch all products with pagination and filters
 */
export const useProducts = (filters?: ProductsFilters) => {
  return useQuery<PaginatedProducts>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.category) params.append('category', filters.category);
      if (filters?.subcategory) params.append('subcategory', filters.subcategory);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.availability) params.append('availability', filters.availability);
      if (filters?.brand) params.append('brand', filters.brand);
      if (filters?.specKey) params.append('specKey', filters.specKey);
      if (filters?.specValue) params.append('specValue', filters.specValue);

      const response = await apiClient.getWithMeta<Product[], { total: number; page: number; limit: number; pages: number }>(
        `${api.products.list}?${params.toString()}`
      );
      
      if (!response.data) {
        throw new Error('No data returned');
      }
      
      return {
        data: response.data,
        meta: response.meta || { total: 0, page: 1, limit: 20, pages: 0 }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
  });
};

/**
 * Hook to search products by name, SKU, or ID
 * This is a convenience hook that uses the same endpoint with search parameter
 */
export const useProductSearch = (searchQuery: string, enabled: boolean = true) => {
  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return [];
      }

      const response = await apiClient.getWithMeta<Product[], { total: number; page: number; limit: number; pages: number }>(
        `${api.products.search}?search=${encodeURIComponent(searchQuery)}&limit=20`
      );
      
      if (!response.data) {
        throw new Error('No data returned');
      }
      
      return response.data;
    },
    enabled: enabled && searchQuery.trim().length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to fetch a single product by ID
 */
export const useProductById = (id: string) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get<Product>(api.products.byId(id));
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
