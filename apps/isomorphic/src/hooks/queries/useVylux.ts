'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { formatToNaira } from '@/libs/currencyFormatter';

export type VyluxPriceLine = { label: string; raw: string; min: number | null; max: number | null };

export type VyluxProduct = {
  vyluxId: number;
  title: string;
  /** The Telegram caption without the lines that carry Vylux's prices. */
  description: string;
  prices: VyluxPriceLine[];
  postedAt: string | null;
  media: { type: 'image' | 'video'; url: string; posterUrl: string | null }[];
  telegramUrl: string | null;
  importedProductId: string | null;
};

type VyluxPage = { items: VyluxProduct[]; hasMore: boolean; nextAfter: number | null };

/** Pictures copied into this store's storage, in the product form's `description_images` shape. */
export type VyluxCopiedMedia = { url: string; cover_image: boolean; mediaType: 'image' | 'video'; miniUrl?: string };

export type VyluxPrepared = { product: VyluxProduct; images: VyluxCopiedMedia[]; suggestedSku: number };

/** "Watch Alone: ₦175,000.00" — a Vylux price line for reference. */
export const vyluxPriceLabel = (p: VyluxPriceLine) => {
  if (p.min == null) return p.raw;
  const range = p.max != null && p.max !== p.min ? `${formatToNaira(p.min)} – ${formatToNaira(p.max)}` : formatToNaira(p.min);
  return p.label ? `${p.label}: ${range}` : range;
};

/** The first picture to show for a scraper product (a video's poster when it has no image). */
export const vyluxCover = (p: VyluxProduct) =>
  p.media.find((m) => m.type === 'image')?.url ?? p.media.find((m) => m.posterUrl)?.posterUrl ?? undefined;

/** Accepted scraper products that haven't been added to the store yet. */
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

const preparedKey = (vyluxId: number) => `vylux-prepared:${vyluxId}`;

/** Forget the copied pictures once the product is created. */
export const clearPreparedVylux = (vyluxId: number) => {
  try {
    sessionStorage.removeItem(preparedKey(vyluxId));
  } catch {
    // storage unavailable: nothing to clear
  }
};

/**
 * Copies one scraper product's pictures into this store and returns them with its title, caption
 * and prices, for the prefilled product form. Kept in sessionStorage so a reload of the form
 * reuses the copies instead of copying the pictures again.
 */
export const usePreparedVylux = (vyluxId: number | null) =>
  useQuery<VyluxPrepared>({
    queryKey: ['vylux', 'prepared', vyluxId],
    enabled: vyluxId != null,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        const saved = sessionStorage.getItem(preparedKey(vyluxId!));
        if (saved) return JSON.parse(saved) as VyluxPrepared;
      } catch {
        // storage unavailable or corrupt: copy again
      }
      const response = await apiClient.post<VyluxPrepared>(api.vylux.prepare(vyluxId!));
      if (!response.data) throw new Error('No data returned');
      try {
        sessionStorage.setItem(preparedKey(vyluxId!), JSON.stringify(response.data));
      } catch {
        // storage unavailable: a reload copies again
      }
      return response.data;
    },
  });
