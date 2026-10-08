'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActionIcon, Alert, Button, Input, Loader, Switch, Text, Textarea } from 'rizzui';
import { PiArrowDownBold, PiArrowUpBold, PiPlusBold, PiTrashBold, PiXBold } from 'react-icons/pi';
import FormFooter from '@core/components/form-footer';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import ImageField from '@/app/shared/content/image-field';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useSiteContent } from '@/hooks/queries/useContent';
import { useUpdateSiteContent } from '@/hooks/mutations/useContentMutations';
import { SiteContent, toSlug } from '@/types/content.types';

// Limits mirror Main-server's ContentValidator.siteContent.
const siteContentSchema = z.object({
  testimonials: z
    .array(
      z.object({
        quote: z.string().trim().min(1, 'Quote is required'),
        author: z.string().trim().min(1, 'Author is required'),
      })
    )
    .max(50, 'At most 50 testimonials'),
  instagram: z
    .array(z.object({ image: z.string().min(1, 'Upload an image or remove this tile'), link: z.string() }))
    .max(24, 'At most 24 Instagram tiles'),
  popularSearches: z.array(z.string()).max(20, 'At most 20 popular searches'),
  articleCategories: z
    .array(z.object({ value: z.string(), label: z.string().trim().min(1, 'Label is required') }))
    .max(20, 'At most 20 categories'),
  newsletterPopup: z.object({
    enabled: z.boolean(),
    headline: z.string(),
    body: z.string(),
    couponCode: z.string(),
  }),
});

type SiteContentFormValues = z.infer<typeof siteContentSchema>;

const useFormContextTyped = () => useFormContext<SiteContentFormValues>();

const toFormValues = (c?: SiteContent): SiteContentFormValues => ({
  testimonials: c?.testimonials?.map((t) => ({ quote: t.quote, author: t.author })) ?? [],
  instagram: c?.instagram?.map((i) => ({ image: i.image, link: i.link ?? '' })) ?? [],
  popularSearches: c?.popularSearches ?? [],
  articleCategories: c?.articleCategories?.map((a) => ({ value: a.value, label: a.label })) ?? [],
  newsletterPopup: {
    enabled: c?.newsletterPopup?.enabled ?? false,
    headline: c?.newsletterPopup?.headline ?? '',
    body: c?.newsletterPopup?.body ?? '',
    couponCode: c?.newsletterPopup?.couponCode ?? '',
  },
});

const toPayload = (v: SiteContentFormValues): Partial<SiteContent> => ({
  testimonials: v.testimonials.map((t) => ({ quote: t.quote.trim(), author: t.author.trim() })),
  instagram: v.instagram.map((i) => ({ image: i.image, ...(i.link.trim() ? { link: i.link.trim() } : {}) })),
  popularSearches: v.popularSearches,
  // The value is what articles store; derive it from the label when left empty.
  articleCategories: v.articleCategories.map((a) => ({
    value: a.value.trim() || toSlug(a.label),
    label: a.label.trim(),
  })),
  newsletterPopup: {
    enabled: v.newsletterPopup.enabled,
    headline: v.newsletterPopup.headline.trim(),
    body: v.newsletterPopup.body.trim(),
    couponCode: v.newsletterPopup.couponCode.trim().toUpperCase(),
  },
});

const sectionClass = 'border-t border-dashed border-muted pt-7';

export default function SiteContentForm() {
  const { data, isLoading, error } = useSiteContent();
  const methods = useForm<SiteContentFormValues>({
    resolver: zodResolver(siteContentSchema),
    defaultValues: toFormValues(),
  });
  const { reset, handleSubmit } = methods;
  const updateMutation = useUpdateSiteContent();

  useEffect(() => {
    if (data) reset(toFormValues(data));
  }, [data, reset]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load site content</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={handleSubmit((values) => updateMutation.mutate(toPayload(values)))}
        className="@container flex flex-col gap-8"
      >
        <TestimonialsSection />
        <InstagramSection />
        <PopularSearchesSection />
        <ArticleCategoriesSection />
        <NewsletterSection />
        <FormFooter
          isLoading={updateMutation.isPending}
          submitBtnText="Save site content"
          altBtnText="Reset"
          handleAltBtn={() => reset(toFormValues(data))}
        />
      </form>
    </FormProvider>
  );
}

function RowActions({
  index,
  count,
  move,
  remove,
}: {
  index: number;
  count: number;
  move: (from: number, to: number) => void;
  remove: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <ActionIcon size="sm" variant="outline" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move up">
        <PiArrowUpBold className="h-4 w-4" />
      </ActionIcon>
      <ActionIcon
        size="sm"
        variant="outline"
        disabled={index === count - 1}
        onClick={() => move(index, index + 1)}
        aria-label="Move down"
      >
        <PiArrowDownBold className="h-4 w-4" />
      </ActionIcon>
      <ActionIcon size="sm" variant="flat" color="danger" onClick={() => remove(index)} aria-label="Remove">
        <PiTrashBold className="h-4 w-4" />
      </ActionIcon>
    </div>
  );
}

function TestimonialsSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContextTyped();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'testimonials' });
  return (
    <VerticalFormBlockWrapper title="Testimonials" description="Customer quotes on the home page, in this order.">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
          <div className="flex items-center justify-between">
            <Text className="font-medium">Testimonial {index + 1}</Text>
            <RowActions index={index} count={fields.length} move={move} remove={remove} />
          </div>
          <Textarea
            label="Quote"
            rows={3}
            {...register(`testimonials.${index}.quote`)}
            error={errors.testimonials?.[index]?.quote?.message}
          />
          <Input
            label="Author"
            placeholder="Adaeze, Lagos"
            {...register(`testimonials.${index}.author`)}
            error={errors.testimonials?.[index]?.author?.message}
          />
        </div>
      ))}
      {errors.testimonials?.message && <Text className="text-sm text-red-600">{errors.testimonials.message}</Text>}
      <Button type="button" variant="outline" className="w-fit" onClick={() => append({ quote: '', author: '' })}>
        <PiPlusBold className="me-1.5 h-4 w-4" />
        Add testimonial
      </Button>
    </VerticalFormBlockWrapper>
  );
}

function InstagramSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContextTyped();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'instagram' });
  return (
    <VerticalFormBlockWrapper
      title="Instagram tiles"
      description="Images for the Instagram strip on the home page. The link is optional (a post or the profile)."
      className={`max-w-none ${sectionClass}`}
    >
      <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
            <div className="flex items-center justify-between">
              <Text className="font-medium">Tile {index + 1}</Text>
              <RowActions index={index} count={fields.length} move={move} remove={remove} />
            </div>
            <Controller
              control={control}
              name={`instagram.${index}.image`}
              render={({ field: imageField }) => (
                <ImageField
                  value={imageField.value}
                  onChange={imageField.onChange}
                  previewClassName="aspect-square max-w-[220px]"
                  error={errors.instagram?.[index]?.image?.message}
                />
              )}
            />
            <Input
              label="Link (optional)"
              placeholder="https://www.instagram.com/p/…"
              {...register(`instagram.${index}.link`)}
            />
          </div>
        ))}
      </div>
      {errors.instagram?.message && <Text className="text-sm text-red-600">{errors.instagram.message}</Text>}
      <Button type="button" variant="outline" className="w-fit" onClick={() => append({ image: '', link: '' })}>
        <PiPlusBold className="me-1.5 h-4 w-4" />
        Add tile
      </Button>
    </VerticalFormBlockWrapper>
  );
}

function PopularSearchesSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContextTyped();
  const searches = watch('popularSearches') ?? [];
  const [text, setText] = useState('');

  const add = () => {
    const value = text.trim();
    if (!value) return;
    if (!searches.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setValue('popularSearches', [...searches, value], { shouldDirty: true });
    }
    setText('');
  };

  return (
    <VerticalFormBlockWrapper
      title="Popular searches"
      description="Suggestions shown in the storefront search before the shopper types."
      className={sectionClass}
    >
      <div className="flex items-center gap-3">
        <Input
          className="flex-grow"
          placeholder="e.g. gold hoops"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" onClick={add} className="shrink-0">
          Add
        </Button>
      </div>
      {searches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {searches.map((s) => (
            <span
              key={s}
              className="flex items-center rounded-full border border-gray-300 bg-gray-50 py-1.5 pe-2.5 ps-3.5 text-sm font-medium text-gray-700"
            >
              {s}
              <button
                type="button"
                onClick={() =>
                  setValue(
                    'popularSearches',
                    searches.filter((x) => x !== s),
                    { shouldDirty: true }
                  )
                }
                className="ps-2 text-gray-500 hover:text-gray-900"
                aria-label={`Remove ${s}`}
              >
                <PiXBold className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {errors.popularSearches?.message && <Text className="text-sm text-red-600">{errors.popularSearches.message}</Text>}
    </VerticalFormBlockWrapper>
  );
}

function ArticleCategoriesSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContextTyped();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'articleCategories' });
  return (
    <VerticalFormBlockWrapper
      title="Article categories"
      description="Journal categories. Articles store the value, so changing a value un-files the articles that use it."
      className={sectionClass}
    >
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-3">
          <Input
            className="flex-grow"
            label={index === 0 ? 'Label' : undefined}
            placeholder="Style guides"
            {...register(`articleCategories.${index}.label`)}
            error={errors.articleCategories?.[index]?.label?.message}
          />
          <Input
            className="flex-grow"
            label={index === 0 ? 'Value' : undefined}
            placeholder="style-guides (defaults to the label)"
            {...register(`articleCategories.${index}.value`)}
          />
          <div className={index === 0 ? 'mt-7' : 'mt-1.5'}>
            <RowActions index={index} count={fields.length} move={move} remove={remove} />
          </div>
        </div>
      ))}
      {errors.articleCategories?.message && (
        <Text className="text-sm text-red-600">{errors.articleCategories.message}</Text>
      )}
      <Button type="button" variant="outline" className="w-fit" onClick={() => append({ value: '', label: '' })}>
        <PiPlusBold className="me-1.5 h-4 w-4" />
        Add category
      </Button>
    </VerticalFormBlockWrapper>
  );
}

function NewsletterSection() {
  const { control, register, watch } = useFormContextTyped();
  const enabled = watch('newsletterPopup.enabled');
  return (
    <VerticalFormBlockWrapper
      title="Newsletter popup"
      description="The sign-up popup on the storefront and the welcome email it sends."
      className={sectionClass}
    >
      <Controller
        control={control}
        name="newsletterPopup.enabled"
        render={({ field }) => (
          <Switch
            label={field.value ? 'Popup is on' : 'Popup is off'}
            checked={!!field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />
      <Input label="Headline" placeholder="10% off your first order" disabled={!enabled} {...register('newsletterPopup.headline')} />
      <Textarea
        label="Body"
        rows={3}
        placeholder="Join the list for new arrivals and members-only offers."
        disabled={!enabled}
        {...register('newsletterPopup.body')}
      />
      <Input
        label="Coupon code"
        placeholder="WELCOME10"
        disabled={!enabled}
        {...register('newsletterPopup.couponCode')}
        helperText={
          <>
            Sent in the welcome email. Create the code on the{' '}
            <Link href={routes.eCommerce.coupons} className="text-primary underline">
              Coupons page
            </Link>{' '}
            first; leave empty to send no code.
          </>
        }
      />
    </VerticalFormBlockWrapper>
  );
}
