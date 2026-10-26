'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { describeApiError } from '@/libs/form-errors';

export type CollectionGroup = 'collections' | 'gifting' | 'men' | 'diamonds';

export interface StoreCollection {
  _id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  group: CollectionGroup;
  order: number;
  showInMenu: boolean;
  active: boolean;
  mode: 'manual' | 'rules';
  products: string[];
  rules: {
    categories: string[];
    tags: string[];
    specs: { key: string; values: string[] }[];
    minPrice?: number;
    maxPrice?: number;
  };
}

export type StoreCollectionInput = Omit<Partial<StoreCollection>, '_id' | 'rules'> & {
  rules?: Omit<StoreCollection['rules'], 'minPrice' | 'maxPrice'> & { minPrice?: number | null; maxPrice?: number | null };
};

const KEY = ['collections'];

export const useStoreCollections = () =>
  useQuery<StoreCollection[]>({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<StoreCollection[]>(api.collections.list)).data ?? [],
  });

function useCollectionMutation<TVariables>(mutationFn: (v: TVariables) => Promise<unknown>, success: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, TVariables>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(success);
      onDone?.();
    },
    onError: (error) => toast.error(describeApiError(error)),
  });
}

export const useCreateCollection = (onDone?: () => void) =>
  useCollectionMutation((data: StoreCollectionInput) => apiClient.post(api.collections.list, data), 'Collection created', onDone);

export const useUpdateCollection = (onDone?: () => void) =>
  useCollectionMutation(
    ({ id, data }: { id: string; data: StoreCollectionInput }) => apiClient.patch(api.collections.byId(id), data),
    'Collection saved',
    onDone
  );

export const useDeleteCollection = () =>
  useCollectionMutation((id: string) => apiClient.delete(api.collections.byId(id)), 'Collection deleted');
