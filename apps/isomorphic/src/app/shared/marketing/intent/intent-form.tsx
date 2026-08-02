'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Select, Text, Title, ActionIcon, Alert } from 'rizzui';
import { Form } from '@core/ui/form';
import { Controller, useFieldArray } from 'react-hook-form';
import { PiPlusBold, PiTrashBold } from 'react-icons/pi';
import { z } from 'zod';
import { routes } from '@/config/routes';
import {
  Intent,
  IntentStatus,
  IntentProduct,
  CreateIntentInput,
  INTENT_STATUS_OPTIONS,
  MIN_PUBLISHED_PRODUCTS,
  slugifyIntent,
} from '@/data/intents-data';
import { useCreateIntent, useUpdateIntent } from '@/hooks/mutations/useIntentMutations';
import IntentProductsPicker from './intent-products-picker';

/**
 * Keywords are entered as comma-separated text — simpler to edit than a tag
 * widget and it round-trips cleanly to the string[] the API expects.
 */
const csvToArray = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const arrayToCsv = (value?: string[]): string => (value || []).join(', ');

const intentProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number().optional(),
  stock: z.number().optional(),
  status: z.string().optional(),
  description_images: z
    .array(z.object({ url: z.string(), cover_image: z.boolean().optional() }))
    .optional(),
  images: z
    .array(z.object({ url: z.string(), cover_image: z.boolean().optional() }))
    .optional(),
});

const intentFormSchema = z
  .object({
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(
        /^[a-z0-9-_]+$/,
        'Slug may only contain lowercase letters, numbers, hyphens and underscores'
      ),
    heading: z.string().min(3, 'Heading is required'),
    title: z.string().min(3, 'Meta title is required'),
    description: z.string().min(20, 'Meta description should be at least 20 characters'),
    intro: z.string().optional(),
    keywords: z.string().optional(),
    status: z.enum(['active', 'inactive', 'draft']),
    products: z.array(intentProductSchema).min(1, 'Select at least one product'),
    faqs: z.array(
      z.object({
        question: z.string().min(1, 'Question is required'),
        answer: z.string().min(1, 'Answer is required'),
      })
    ),
  })
  // Mirrors the backend's publish gate: an active page below the threshold gets
  // indexed and then 404s once the storefront's own gate rejects it.
  .refine(
    (v) => v.status !== 'active' || v.products.length >= MIN_PUBLISHED_PRODUCTS,
    {
      message: `An active page needs at least ${MIN_PUBLISHED_PRODUCTS} products. Save it as a draft instead.`,
      path: ['products'],
    }
  );

type IntentFormValues = z.infer<typeof intentFormSchema>;

function toFormValues(intent?: Intent): IntentFormValues {
  return {
    slug: intent?.slug ?? '',
    heading: intent?.heading ?? '',
    title: intent?.title ?? '',
    description: intent?.description ?? '',
    intro: intent?.intro ?? '',
    keywords: arrayToCsv(intent?.keywords),
    status: (intent?.status ?? 'draft') as IntentStatus,
    products: (intent?.products ?? []) as IntentFormValues['products'],
    faqs: intent?.faqs?.length ? intent.faqs : [],
  };
}

function toPayload(values: IntentFormValues): CreateIntentInput {
  return {
    slug: values.slug.trim().toLowerCase(),
    heading: values.heading.trim(),
    title: values.title.trim(),
    description: values.description.trim(),
    intro: values.intro?.trim() || undefined,
    keywords: csvToArray(values.keywords),
    status: values.status,
    // Only ids go to the API; order is preserved and is the display order.
    products: values.products.map((p) => p._id),
    faqs: values.faqs.filter((f) => f.question.trim() && f.answer.trim()),
  };
}

interface IntentFormProps {
  /** Omit for create; pass the loaded intent to edit. */
  intent?: Intent;
}

export default function IntentForm({ intent }: IntentFormProps) {
  const router = useRouter();
  const isEdit = !!intent;
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateIntent({
    onSuccess: () => router.push(routes.eCommerce.intents),
    onError: (error) => setFormError(error.message),
  });

  const updateMutation = useUpdateIntent({
    onSuccess: () => router.push(routes.eCommerce.intents),
    onError: (error) => setFormError(error.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: IntentFormValues) => {
    setFormError(null);
    const payload = toPayload(values);

    if (isEdit && intent) {
      updateMutation.mutate({ id: intent._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Form<IntentFormValues>
      onSubmit={onSubmit}
      validationSchema={intentFormSchema}
      useFormProps={{ mode: 'onChange', defaultValues: toFormValues(intent) }}
      className="isomorphic-form flex max-w-[820px] flex-col gap-8"
    >
      {({ register, control, watch, setValue, formState: { errors } }) => {
        const heading = watch('heading');

        return (
          <>
            {formError && (
              <Alert color="danger" variant="flat">
                <Text>{formError}</Text>
              </Alert>
            )}

            {/* ── Page identity ─────────────────────────────────────────── */}
            <section className="flex flex-col gap-5">
              <div>
                <Title as="h4">Page</Title>
                <Text className="text-gray-500">
                  Published at <code>/shop/{watch('slug') || 'your-slug'}</code> on the storefront.
                </Text>
              </div>

              <Input
                label="Heading (H1)"
                placeholder="Affordable Office Chairs in Nigeria"
                {...register('heading')}
                error={errors.heading?.message}
              />

              <div className="flex items-end gap-3">
                <Input
                  label="Slug"
                  placeholder="affordable-office-chairs"
                  className="flex-grow"
                  {...register('slug')}
                  error={errors.slug?.message}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mb-[2px]"
                  disabled={!heading}
                  onClick={() =>
                    setValue('slug', slugifyIntent(heading), { shouldValidate: true })
                  }
                >
                  Generate
                </Button>
              </div>

              <Input
                label="Meta title"
                placeholder="Affordable Office Chairs in Nigeria — Cheap & Quality"
                {...register('title')}
                error={errors.title?.message}
              />

              <Textarea
                label="Meta description"
                placeholder="Buy affordable office chairs in Nigeria. Free delivery nationwide and 7-day returns."
                {...register('description')}
                error={errors.description?.message}
              />

              <Textarea
                label="Intro paragraph (optional)"
                placeholder="Shown above the product grid."
                {...register('intro')}
                error={errors.intro?.message}
              />

              <Input
                label="Keywords (comma separated)"
                placeholder="affordable office chairs, cheap office chairs Nigeria"
                {...register('keywords')}
                error={errors.keywords?.message}
              />

              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    label="Status"
                    options={INTENT_STATUS_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.status?.message}
                    helperText="Only Active pages are visible to shoppers and included in the sitemap."
                  />
                )}
              />
            </section>

            {/* ── Products (hand-picked, drag to reorder) ───────────────── */}
            <Controller
              control={control}
              name="products"
              render={({ field }) => (
                <IntentProductsPicker
                  value={field.value as IntentProduct[]}
                  onChange={field.onChange}
                  error={errors.products?.message}
                />
              )}
            />

            {/* ── FAQs ──────────────────────────────────────────────────── */}
            <FaqFieldArray control={control} register={register} errors={errors} />

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(routes.eCommerce.intents)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isPending}>
                {isEdit ? 'Save changes' : 'Create intent shop'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}

/**
 * FAQs render as FAQPage structured data on the storefront, so they are a real
 * ranking surface rather than decoration.
 */
function FaqFieldArray({ control, register, errors }: any) {
  const { fields, append, remove } = useFieldArray({ control, name: 'faqs' });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Title as="h4">FAQs</Title>
          <Text className="text-gray-500">
            Emitted as FAQPage structured data — eligible for rich results.
          </Text>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ question: '', answer: '' })}
        >
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {fields.length === 0 && <Text className="text-gray-500">No FAQs yet.</Text>}

      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
          <div className="flex items-center justify-between">
            <Text className="font-medium">FAQ {index + 1}</Text>
            <ActionIcon
              type="button"
              size="sm"
              variant="flat"
              color="danger"
              onClick={() => remove(index)}
              title="Remove FAQ"
            >
              <PiTrashBold className="h-4 w-4" />
            </ActionIcon>
          </div>
          <Input
            label="Question"
            placeholder="How much does an affordable office chair cost in Nigeria?"
            {...register(`faqs.${index}.question` as const)}
            error={errors?.faqs?.[index]?.question?.message}
          />
          <Textarea
            label="Answer"
            placeholder="Prices vary by design and material..."
            {...register(`faqs.${index}.answer` as const)}
            error={errors?.faqs?.[index]?.answer?.message}
          />
        </div>
      ))}
    </section>
  );
}
