'use client';

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { describeApiError } from '@/libs/form-errors';
import {
  Article,
  ArticleInput,
  FaqGroup,
  FaqGroupInput,
  LegalDocument,
  LegalDocumentInput,
  SiteContent,
  SizeChart,
  SizeChartInput,
} from '@/types/content.types';

type Options<TData, TVariables> = Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>;

/**
 * Every content write follows the same shape: call the endpoint, refresh the content queries,
 * toast the result. Callers add navigation through `options.onSuccess`.
 */
function useContentMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage: string,
  options?: Options<TData, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success(successMessage);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(describeApiError(error));
      options?.onError?.(error, variables, context);
    },
  });
}

const unwrap = <T>(data: T | null): T => {
  if (data == null) throw new Error('No data returned from server');
  return data;
};

// Articles
export const useCreateArticle = (options?: Options<Article, ArticleInput>) =>
  useContentMutation(
    async (data) => unwrap((await apiClient.post<Article>(api.content.articles, data)).data),
    'Article created',
    options
  );

export const useUpdateArticle = (options?: Options<Article, { id: string; data: Partial<ArticleInput> }>) =>
  useContentMutation(
    async ({ id, data }) => unwrap((await apiClient.patch<Article>(api.content.article(id), data)).data),
    'Article saved',
    options
  );

export const useDeleteArticle = (options?: Options<void, string>) =>
  useContentMutation(
    async (id) => {
      await apiClient.delete(api.content.article(id));
    },
    'Article deleted',
    options
  );

// Site content
export const useUpdateSiteContent = (options?: Options<SiteContent, Partial<SiteContent>>) =>
  useContentMutation(
    async (data) => unwrap((await apiClient.put<SiteContent>(api.content.site, data)).data),
    'Site content saved',
    options
  );

// FAQs
export const useCreateFaqGroup = (options?: Options<FaqGroup, FaqGroupInput>) =>
  useContentMutation(
    async (data) => unwrap((await apiClient.post<FaqGroup>(api.content.faqs, data)).data),
    'FAQ group created',
    options
  );

export const useUpdateFaqGroup = (options?: Options<FaqGroup, { id: string; data: Partial<FaqGroupInput> }>) =>
  useContentMutation(
    async ({ id, data }) => unwrap((await apiClient.patch<FaqGroup>(api.content.faq(id), data)).data),
    'FAQ group saved',
    options
  );

export const useDeleteFaqGroup = (options?: Options<void, string>) =>
  useContentMutation(
    async (id) => {
      await apiClient.delete(api.content.faq(id));
    },
    'FAQ group deleted',
    options
  );

// Legal pages
export const useCreateLegalDocument = (options?: Options<LegalDocument, LegalDocumentInput>) =>
  useContentMutation(
    async (data) => unwrap((await apiClient.post<LegalDocument>(api.content.legal, data)).data),
    'Legal page created',
    options
  );

export const useUpdateLegalDocument = (
  options?: Options<LegalDocument, { id: string; data: Partial<LegalDocumentInput> }>
) =>
  useContentMutation(
    async ({ id, data }) => unwrap((await apiClient.patch<LegalDocument>(api.content.legalDoc(id), data)).data),
    'Legal page saved',
    options
  );

export const useDeleteLegalDocument = (options?: Options<void, string>) =>
  useContentMutation(
    async (id) => {
      await apiClient.delete(api.content.legalDoc(id));
    },
    'Legal page deleted',
    options
  );

// Size charts
export const useCreateSizeChart = (options?: Options<SizeChart, SizeChartInput>) =>
  useContentMutation(
    async (data) => unwrap((await apiClient.post<SizeChart>(api.content.sizeCharts, data)).data),
    'Size chart created',
    options
  );

export const useUpdateSizeChart = (options?: Options<SizeChart, { id: string; data: Partial<SizeChartInput> }>) =>
  useContentMutation(
    async ({ id, data }) => unwrap((await apiClient.patch<SizeChart>(api.content.sizeChart(id), data)).data),
    'Size chart saved',
    options
  );

export const useDeleteSizeChart = (options?: Options<void, string>) =>
  useContentMutation(
    async (id) => {
      await apiClient.delete(api.content.sizeChart(id));
    },
    'Size chart deleted',
    options
  );
