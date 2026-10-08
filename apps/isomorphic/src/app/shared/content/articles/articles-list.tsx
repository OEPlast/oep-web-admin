'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ActionIcon, Alert, Badge, Button, Input, Loader, Text, Title, Tooltip } from 'rizzui';
import { PiMagnifyingGlassBold, PiPencilBold, PiPlusBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import { getCdnUrl } from '@core/utils/cdn-url';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useArticles, useSiteContent } from '@/hooks/queries/useContent';
import { useDeleteArticle } from '@/hooks/mutations/useContentMutations';
import SimplePager from '@/app/shared/simple-pager';
import { ArticleStatus } from '@/types/content.types';

type Filter = 'all' | ArticleStatus;

const FILTERS: Array<{ label: string; value: Filter }> = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
];

const PAGE_SIZE = 20;

/** Published with a future date: saved as published but not live yet. */
const isScheduled = (status: ArticleStatus, publishedAt?: string | null) =>
  status === 'published' && !!publishedAt && new Date(publishedAt).getTime() > Date.now();

export default function ArticlesList() {
  const [filter, setFilter] = useState<Filter>('all');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const { data, isLoading, isFetching, error } = useArticles({
    page,
    limit: PAGE_SIZE,
    status: filter === 'all' ? undefined : filter,
    search,
  });
  const { data: site } = useSiteContent();
  const { mutate: deleteArticle } = useDeleteArticle();

  const categoryLabel = (value: string) =>
    site?.articleCategories.find((c) => c.value === value)?.label ?? value;

  const articles = data?.items ?? [];
  const meta = data?.meta;

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load articles</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? 'solid' : 'outline'}
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <Input
          className="w-full sm:w-72"
          placeholder="Search titles…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
          clearable
          onClear={() => setSearchText('')}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted py-16">
          <Title as="h5">{search || filter !== 'all' ? 'No matching articles' : 'No articles yet'}</Title>
          <Text className="max-w-md text-center text-gray-500">
            Articles appear in the storefront journal once they are published.
          </Text>
          <Link href={routes.content.createArticle}>
            <Button>
              <PiPlusBold className="me-1.5 h-4 w-4" />
              Write an article
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const scheduled = isScheduled(article.status, article.publishedAt);
                return (
                  <tr key={article._id} className="border-t border-muted align-top">
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded border border-muted bg-gray-100">
                          {article.image && (
                            <img src={getCdnUrl(article.image)} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={routes.content.editArticle(article._id)}
                            className="font-medium text-gray-900 hover:underline"
                          >
                            {article.title}
                          </Link>
                          <Text className="text-xs text-gray-500">/{article.slug}</Text>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="flat"
                        color={article.status === 'published' ? (scheduled ? 'info' : 'success') : 'warning'}
                      >
                        {scheduled ? 'scheduled' : article.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{article.category ? categoryLabel(article.category) : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip content="Edit" placement="top">
                          <Link href={routes.content.editArticle(article._id)}>
                            <ActionIcon size="sm" variant="outline" aria-label="Edit article">
                              <PiPencilBold className="h-4 w-4" />
                            </ActionIcon>
                          </Link>
                        </Tooltip>
                        <DeletePopover
                          title="Delete article"
                          description={`Delete "${article.title}"? This can't be undone.`}
                          onDelete={() => deleteArticle(article._id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && <SimplePager page={meta.page} pages={meta.pages} total={meta.total} onChange={setPage} isLoading={isFetching} />}
    </div>
  );
}
