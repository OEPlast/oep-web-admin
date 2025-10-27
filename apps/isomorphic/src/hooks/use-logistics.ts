'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import toast from 'react-hot-toast';
import type {
  LogisticsConfig,
  CountryListItem,
  CreateConfigInput,
  UpdateConfigInput,
  CreateEmptyCountryInput,
  QuoteInput,
  QuoteResult,
  FlatShippingInput,
  FlatShippingResult,
  LocationTree,
} from '@/types/logistics.types';

// ============================================================================
// Query Keys Factory
// ============================================================================

export const logisticsKeys = {
  all: ['logistics'] as const,
  countries: () => [...logisticsKeys.all, 'countries'] as const,
  countryByName: (name: string) =>
    [...logisticsKeys.all, 'country', name] as const,
  locationsTree: () => [...logisticsKeys.all, 'locations-tree'] as const,
} as const;

// ============================================================================
// Query Hooks (Data Fetching)
// ============================================================================

/**
 * Hook to fetch all logistics countries (list view)
 * GET /admin/logistics/countries
 *
 * Returns: Array of { _id, countryCode, countryName }
 * Use case: Country list table, dropdowns
 */
export function useLogisticsCountries(
  options?: Omit<
    UseQueryOptions<CountryListItem[], Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<CountryListItem[], Error>({
    queryKey: logisticsKeys.countries(),
    queryFn: async () => {
      const response = await apiClient.get<CountryListItem[]>(
        api.logistics.countries
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    placeholderData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single country logistics configuration by name
 * GET /admin/logistics/one/:country
 *
 * @param countryName - Country name to fetch
 * @param enabled - Whether to enable the query (default: true if countryName exists)
 *
 * Returns: Full LogisticsConfig with states, cities, LGAs, and pricing
 * Use case: Editing country configuration
 */
export function useLogisticsCountry(
  countryName: string,
  options?: Omit<
    UseQueryOptions<LogisticsConfig, Error>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<LogisticsConfig, Error>({
    queryKey: logisticsKeys.countryByName(countryName),
    queryFn: async () => {
      const response = await apiClient.get<LogisticsConfig>(
        api.logistics.byCountry(countryName)
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    enabled: !!countryName,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch public locations tree (no pricing info)
 * GET /logistics/locations-tree
 *
 * Returns: Hierarchical structure of countries > states > cities/LGAs
 * Use case: Location picker in checkout, public shipping calculator
 */
export function useLocationsTree(
  options?: Omit<UseQueryOptions<LocationTree, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<LocationTree, Error>({
    queryKey: logisticsKeys.locationsTree(),
    queryFn: async () => {
      const response = await apiClient.get<LocationTree>(
        api.logistics.locationsTree
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
    ...options,
  });
}

// ============================================================================
// Mutation Hooks (Data Modification)
// ============================================================================

/**
 * Hook to create a full logistics configuration
 * POST /admin/logistics/config
 *
 * @param onSuccess - Optional callback on successful creation
 *
 * Use case: Admin creating new country with full state/city/LGA data
 */
export function useCreateLogisticsConfig(
  onSuccess?: (data: LogisticsConfig) => void
) {
  const queryClient = useQueryClient();

  return useMutation<LogisticsConfig, Error, CreateConfigInput>({
    mutationFn: async (data: CreateConfigInput) => {
      const response = await apiClient.post<LogisticsConfig>(
        api.logistics.createConfig,
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.countries() });
      queryClient.invalidateQueries({
        queryKey: logisticsKeys.countryByName(data.countryName),
      });
      toast.success(data.countryName + ' configuration created successfully');
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create configuration';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to update an existing logistics configuration
 * PATCH /admin/logistics/config/:id
 *
 * @param onSuccess - Optional callback on successful update
 *
 * Use case: Admin editing country configuration (states, cities, LGAs, pricing)
 */
export function useUpdateLogisticsConfig(
  onSuccess?: (data: LogisticsConfig) => void
) {
  const queryClient = useQueryClient();

  return useMutation<
    LogisticsConfig,
    Error,
    { id: string; data: UpdateConfigInput }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<LogisticsConfig>(
        api.logistics.updateConfig(id),
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.countries() });
      if (variables.data.countryName) {
        queryClient.invalidateQueries({
          queryKey: logisticsKeys.countryByName(variables.data.countryName),
        });
      }
      if (data.countryName) {
        queryClient.invalidateQueries({
          queryKey: logisticsKeys.countryByName(data.countryName),
        });
      }
      toast.success('Configuration updated successfully');
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update configuration';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to create an empty country (no states)
 * POST /admin/logistics/country/add
 *
 * @param onSuccess - Optional callback on successful creation
 *
 * Use case: Admin creating country shell before adding detailed location data
 */
export function useCreateEmptyCountry(
  onSuccess?: (data: LogisticsConfig) => void
) {
  const queryClient = useQueryClient();

  return useMutation<LogisticsConfig, Error, CreateEmptyCountryInput>({
    mutationFn: async (data: CreateEmptyCountryInput) => {
      const response = await apiClient.post<LogisticsConfig>(
        api.logistics.createEmptyCountry,
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.countries() });
      toast.success(`${data.countryName} created successfully`);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create country';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to delete a country by MongoDB _id
 * DELETE /admin/logistics/country/:id
 *
 * @param onSuccess - Optional callback on successful deletion
 *
 * Use case: Admin removing unsupported countries
 */
export function useDeleteCountry(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await apiClient.delete(api.logistics.deleteCountry(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logisticsKeys.countries() });
      toast.success('Country deleted successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to delete country';
      toast.error(errorMessage);
    },
  });
}

// ============================================================================
// Public/Utility Hooks
// ============================================================================

/**
 * Hook to get shipping quote for a single product
 * POST /logistics/quote
 *
 * Use case: Product page shipping estimate, cart preview
 *
 * Returns: Detailed quote with base price, final price, ETA, and breakdown
 */
export function useShippingQuote(onSuccess?: (data: QuoteResult) => void) {
  return useMutation<QuoteResult, Error, QuoteInput>({
    mutationFn: async (data: QuoteInput) => {
      const response = await apiClient.post<QuoteResult>(
        api.logistics.quote,
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to get shipping quote';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to calculate flat cart shipping with progressive pricing
 * POST /logistics/cart/flat-shipping
 *
 * Use case: Cart checkout, final shipping cost calculation
 *
 * Returns: Final shipping amount considering cart size, location, and product modifiers
 */
export function useCartShipping(
  onSuccess?: (data: FlatShippingResult) => void
) {
  return useMutation<FlatShippingResult, Error, FlatShippingInput>({
    mutationFn: async (data: FlatShippingInput) => {
      const response = await apiClient.post<FlatShippingResult>(
        api.logistics.cartShipping,
        data
      );
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      return response.data;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to calculate shipping';
      toast.error(errorMessage);
    },
  });
}
