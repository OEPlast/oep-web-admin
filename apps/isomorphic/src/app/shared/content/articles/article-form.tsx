'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Input, Loader, Select, Text, Textarea } from 'rizzui';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import ImageField from '@/app/shared/content/image-field';
import BlockEditor from '@/app/shared/content/articles/block-editor';
import { routes } from '@/config/routes';
import { useArticle, useSiteContent } from '@/hooks/queries/useContent';
import { useCreateArticle, useUpdateArticle } from '@/hooks/mutations/useContentMutations';
import { describeApiError } from '@/libs/form-errors';
import {
  Article,
  ARTICLE_STATUS_OPTIONS,
  ArticleBlock,
  ArticleInput,
  BLOCK_TYPE_OPTIONS,
  toSlug,
} from '@/types/content.types';

const blockSchema = z
  .object({
    type: z.enum(BLOCK_TYPE_OPTIONS.map((o) => o.value) as [string, ...string[]]),
    text: z.string(),
    src: z.string(),
    alt: z.string(),
  })
  .superRefine((block, ctx) => {
    if (block.type === 'image' && !block.src) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['src'], message: 'Upload an image or remove this block' });
    }
    if (block.type !== 'image' && !block.text.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['text'], message: 'Write something or remove this block' });
    }
  });

const articleFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  slug: z.string().trim().max(200).optional(),
  excerpt: z.string().max(500, 'Excerpt must be at most 500 characters'),
  category: z.string(),
  image: z.string(),
  status: z.enum(['draft', 'published']),
  /** datetime-local value, '' for none */
  publishedAt: z.string(),
  body: z.array(blockSchema),
  seoTitle: z.string().max(70, 'Keep the SEO title to 70 characters'),
  seoDescription: z.string().max(160, 'Keep the SEO description to 160 characters'),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

/** ISO date → the local "YYYY-MM-DDTHH:mm" a datetime-local input shows. */
const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function toFormValues(article?: Article): ArticleFormValues {
  return {
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    category: article?.category ?? '',
    image: article?.image ?? '',
    status: article?.status ?? 'draft',
    publishedAt: toLocalInput(article?.publishedAt),
    body: (article?.body ?? []).map((b) => ({
      type: b.type,
      text: 'text' in b ? (b.text ?? '') : '',
      src: 'src' in b ? (b.src ?? '') : '',
      alt: 'alt' in b ? (b.alt ?? '') : '',
    })),
    seoTitle: article?.seo?.title ?? '',
    seoDescription: article?.seo?.description ?? '',
  };
}

function toBlocks(body: ArticleFormValues['body']): ArticleBlock[] {
  return body.map((b) =>
    b.type === 'image'
      ? { type: 'image', src: b.src, ...(b.alt.trim() ? { alt: b.alt.trim() } : {}) }
      : { type: b.type as Exclude<ArticleBlock['type'], 'image'>, text: b.text.trim() }
  );
}

function toPayload(values: ArticleFormValues, article?: Article): ArticleInput {
  const payload: ArticleInput = {
    title: values.title.trim(),
    excerpt: values.excerpt.trim(),
    category: values.category,
    image: values.image,
    status: values.status,
    body: toBlocks(values.body),
    seo: { title: values.seoTitle.trim(), description: values.seoDescription.trim() },
  };
  const slug = values.slug?.trim();
  // An empty slug on create lets the backend derive it from the title; on update it must not be
  // sent empty (the backend would fail the required check).
  if (slug) payload.slug = slug;

  const initial = toLocalInput(article?.publishedAt);
  if (values.publishedAt) {
    // Only send the date when it changed, so the minutes of an untouched date never drift.
    if (values.publishedAt !== initial) payload.publishedAt = new Date(values.publishedAt).toISOString();
  } else if (article?.publishedAt) {
    // Cleared: publishing without a date means now; a draft simply loses its date.
    payload.publishedAt = values.status === 'published' ? new Date().toISOString() : null;
  }
  return payload;
}

export default function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const isEdit = !!article;
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const { data: site } = useSiteContent();

  const methods = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: toFormValues(article),
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const onSaved = () => router.push(routes.content.articles);
  const onFailed = (error: unknown) => setFormError(describeApiError(error));
  const createMutation = useCreateArticle({ onSuccess: onSaved, onError: onFailed });
  const updateMutation = useUpdateArticle({ onSuccess: onSaved, onError: onFailed });
  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: ArticleFormValues) => {
    setFormError(null);
    const payload = toPayload(values, article);
    if (article) updateMutation.mutate({ id: article._id, data: payload });
    else createMutation.mutate(payload);
  };

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...(site?.articleCategories ?? []).map((c) => ({ value: c.value, label: c.label })),
  ];
  const currentCategory = watch('category');
  if (currentCategory && !categoryOptions.some((o) => o.value === currentCategory)) {
    categoryOptions.push({ value: currentCategory, label: `${currentCategory} (not in the category list)` });
  }

  const status = watch('status');
  const excerpt = watch('excerpt') ?? '';
  const seoTitle = watch('seoTitle') ?? '';
  const seoDescription = watch('seoDescription') ?? '';

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="@container flex max-w-[900px] flex-col gap-8">
        {formError && (
          <Alert color="danger" variant="flat">
            <Text>{formError}</Text>
          </Alert>
        )}

        <VerticalFormBlockWrapper title="Article" description="Title, address and the summary shown in the journal list.">
          <Input
            label="Title"
            placeholder="How to choose a ring size"
            {...register('title', {
              onChange: (e) => {
                if (!slugTouched) setValue('slug', toSlug(e.target.value));
              },
            })}
            error={errors.title?.message}
          />
          <Input
            label="Slug"
            placeholder="how-to-choose-a-ring-size"
            helperText={isEdit ? 'Changing the slug changes the article URL.' : 'Defaults to the title.'}
            {...register('slug', { onChange: () => setSlugTouched(true) })}
            error={errors.slug?.message}
          />
          <Textarea
            label="Excerpt"
            placeholder="One or two sentences for the article card."
            rows={3}
            {...register('excerpt')}
            helperText={`${excerpt.length}/500`}
            error={errors.excerpt?.message}
          />
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                label="Category"
                options={categoryOptions}
                value={categoryOptions.find((o) => o.value === field.value) ?? null}
                onChange={(v: string) => field.onChange(v)}
                getOptionValue={(o) => o.value}
                getOptionDisplayValue={(o) => o.label}
                helperText="Categories are managed on the Home & site content page."
              />
            )}
          />
          <Controller
            control={control}
            name="image"
            render={({ field }) => <ImageField label="Cover image" value={field.value} onChange={field.onChange} />}
          />
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper title="Publishing" className="border-t border-dashed border-muted pt-7">
          <div className="grid gap-4 @lg:grid-cols-2">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Status"
                  options={ARTICLE_STATUS_OPTIONS}
                  value={ARTICLE_STATUS_OPTIONS.find((o) => o.value === field.value) ?? null}
                  onChange={(v: string) => field.onChange(v)}
                  getOptionValue={(o) => o.value}
                  getOptionDisplayValue={(o) => o.label}
                />
              )}
            />
            <Input
              type="datetime-local"
              label="Publish date"
              {...register('publishedAt')}
              helperText={
                status === 'published'
                  ? 'Leave empty to publish now. A future date schedules it.'
                  : 'Used when the article is published.'
              }
            />
          </div>
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper
          title="Body"
          description="The article as blocks, in reading order."
          className="max-w-none border-t border-dashed border-muted pt-7"
        >
          <BlockEditor />
        </VerticalFormBlockWrapper>

        <VerticalFormBlockWrapper
          title="SEO"
          description="Optional. The title and excerpt are used when these are empty."
          className="border-t border-dashed border-muted pt-7"
        >
          <Input
            label="SEO title"
            {...register('seoTitle')}
            helperText={`${seoTitle.length}/70`}
            error={errors.seoTitle?.message}
          />
          <Textarea
            label="SEO description"
            rows={3}
            {...register('seoDescription')}
            helperText={`${seoDescription.length}/160`}
            error={errors.seoDescription?.message}
          />
        </VerticalFormBlockWrapper>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(routes.content.articles)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEdit ? 'Save article' : 'Create article'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

/** The edit page: loads the article, then shows the form. */
export function EditArticle({ id }: { id: string }) {
  const { data, isLoading, error } = useArticle(id);
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <Alert color="danger" variant="flat">
        <Text>Could not load this article. It may have been deleted.</Text>
      </Alert>
    );
  }
  return <ArticleForm article={data} />;
}
