'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';

export type VyluxPriceLine = { label: string; raw: string; min: number | null; max: number | null };

export type VyluxProduct = {
  vyluxId: number;
  title: string;
  description: string;
  prices: VyluxPriceLine[];
  postedAt: string | null;
  media: { type: 'image' | 'video'; url: string; posterUrl: string | null }[];
  telegramUrl: string | null;
  importedProductId: string | null;
};

type VyluxPage = { items: VyluxProduct[]; hasMore: boolean; nextAfter: number | null };

export type VyluxImportItem = {
  vyluxId: number;
  categoryId: string;
  price: number;
  name?: string;
  description?: string;
};

export type VyluxImportResult = { vyluxId: number; ok: boolean; productId?: string; error?: string };

/** Main-server takes at most this many per import request. */
export const VYLUX_IMPORT_BATCH = 10;

export const useVyluxProducts = () =>
  useInfiniteQuery<VyluxPage>({
    queryKey: ['vylux', 'products'],
    initialPageParam: undefined as number | undefined,
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.get<VyluxPage>(api.vylux.products, {
        params: { limit: 50, after: pageParam },
      });
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    getNextPageParam: (last) => (last.hasMore ? (last.nextAfter ?? undefined) : undefined),
    staleTime: 30 * 1000,
  });

/** Imports in batches of VYLUX_IMPORT_BATCH and returns every per-item result. */
export const useImportVylux = () => {
  const queryClient = useQueryClient();
  return useMutation<VyluxImportResult[], Error, VyluxImportItem[]>({
    mutationFn: async (items) => {
      const results: VyluxImportResult[] = [];
      for (let i = 0; i < items.length; i += VYLUX_IMPORT_BATCH) {
        const response = await apiClient.post<VyluxImportResult[]>(api.vylux.import, {
          items: items.slice(i, i + VYLUX_IMPORT_BATCH),
        });
        results.push(...(response.data ?? []));
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['vylux'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      const ok = results.filter((r) => r.ok).length;
      const failed = results.length - ok;
      if (ok) toast.success(`Imported ${ok} product${ok === 1 ? '' : 's'} as inactive drafts`);
      if (failed) toast.error(`${failed} product${failed === 1 ? '' : 's'} could not be imported`);
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
