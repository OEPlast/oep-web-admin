'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import {
  Article,
  ArticleListFilters,
  ArticleSummary,
  FaqGroup,
  LegalDocument,
  LegalDocumentSummary,
  PaginationMeta,
  SiteContent,
  SizeChart,
} from '@/types/content.types';

export const contentKeys = {
  all: ['content'] as const,
  articles: (filters?: ArticleListFilters) => ['content', 'articles', filters ?? {}] as const,
  article: (id: string) => ['content', 'article', id] as const,
  site: ['content', 'site'] as const,
  faqs: ['content', 'faqs'] as const,
  legal: ['content', 'legal'] as const,
  legalDoc: (id: string) => ['content', 'legal', id] as const,
  sizeCharts: ['content', 'size-charts'] as const,
  sizeChart: (id: string) => ['content', 'size-chart', id] as const,
};

export const useArticles = (filters: ArticleListFilters) =>
  useQuery<{ items: ArticleSummary[]; meta?: PaginationMeta }>({
    queryKey: contentKeys.articles(filters),
    queryFn: async () => {
      const response = await apiClient.getWithMeta<ArticleSummary[], PaginationMeta>(api.content.articles, {
        params: {
          page: filters.page,
          limit: filters.limit,
          status: filters.status || undefined,
          search: filters.search || undefined,
        },
      });
      return { items: response.data ?? [], meta: response.meta };
    },
    placeholderData: (previous) => previous,
  });

export const useArticle = (id: string) =>
  useQuery<Article>({
    queryKey: contentKeys.article(id),
    queryFn: async () => {
      const response = await apiClient.get<Article>(api.content.article(id));
      if (!response.data) throw new Error('Article not found');
      return response.data;
    },
    enabled: !!id,
  });

export const useSiteContent = () =>
  useQuery<SiteContent>({
    queryKey: contentKeys.site,
    queryFn: async () => {
      const response = await apiClient.get<SiteContent>(api.content.site);
      if (!response.data) throw new Error('No site content returned');
      return response.data;
    },
  });

export const useFaqGroups = () =>
  useQuery<FaqGroup[]>({
    queryKey: contentKeys.faqs,
    queryFn: async () => {
      const response = await apiClient.get<FaqGroup[]>(api.content.faqs);
      return response.data ?? [];
    },
  });

export const useLegalDocuments = () =>
  useQuery<LegalDocumentSummary[]>({
    queryKey: contentKeys.legal,
    queryFn: async () => {
      const response = await apiClient.get<LegalDocumentSummary[]>(api.content.legal);
      return response.data ?? [];
    },
  });

export const useLegalDocument = (id: string) =>
  useQuery<LegalDocument>({
    queryKey: contentKeys.legalDoc(id),
    queryFn: async () => {
      const response = await apiClient.get<LegalDocument>(api.content.legalDoc(id));
      if (!response.data) throw new Error('Document not found');
      return response.data;
    },
    enabled: !!id,
  });

export const useSizeCharts = () =>
  useQuery<SizeChart[]>({
    queryKey: contentKeys.sizeCharts,
    queryFn: async () => {
      const response = await apiClient.get<SizeChart[]>(api.content.sizeCharts);
      return response.data ?? [];
    },
  });

export const useSizeChart = (id: string) =>
  useQuery<SizeChart>({
    queryKey: contentKeys.sizeChart(id),
    queryFn: async () => {
      const response = await apiClient.get<SizeChart>(api.content.sizeChart(id));
      if (!response.data) throw new Error('Size chart not found');
      return response.data;
    },
    enabled: !!id,
  });

/**
 * Size charts as select options (slug as the value), for the product and category forms.
 * Those forms are always on, so a missing `content` permission (403) or an older backend
 * just means no options instead of an error. A slug that is set but not in the list is kept
 * as its own option so saving the form never drops it.
 */
export const useSizeChartOptions = (currentSlug?: string | null) => {
  const query = useQuery<SizeChart[]>({
    queryKey: contentKeys.sizeCharts,
    queryFn: async () => {
      const response = await apiClient.get<SizeChart[]>(api.content.sizeCharts);
      return response.data ?? [];
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const options = (query.data ?? []).map((c) => ({ value: c.slug, label: `${c.title} (${c.slug})` }));
  if (currentSlug && !options.some((o) => o.value === currentSlug)) {
    options.push({ value: currentSlug, label: currentSlug });
  }
  return { options, isLoading: query.isLoading, isError: query.isError };
};
