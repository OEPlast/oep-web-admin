'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
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

// Links are storefront paths ("/shop?gender=women") or full URLs.
const link = z.string().trim().max(300, 'At most 300 characters');

// Limits mirror Main-server's ContentValidator.siteContent.
const siteContentSchema = z.object({
  home: z.object({
    hero: z.object({
      image: z.string(),
      title: z.string().trim().max(120, 'At most 120 characters'),
      ctaLabel: z.string().trim().max(40, 'At most 40 characters'),
      ctaHref: link,
    }),
    tiles: z
      .array(
        z.object({
          image: z.string().min(1, 'Upload an image or remove this tile'),
          label: z.string().trim().min(1, 'Label is required'),
          href: link.min(1, 'Link is required'),
        })
      )
      .max(4, 'At most 4 tiles'),
    feature: z.object({
      image: z.string(),
      title: z.string().trim().max(120, 'At most 120 characters'),
      text: z.string().trim().max(400, 'At most 400 characters'),
      ctaLabel: z.string().trim().max(40, 'At most 40 characters'),
      ctaHref: link,
    }),
  }),
  listingTiles: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'Title is required').max(80, 'At most 80 characters'),
        text: z.string().trim().max(200, 'At most 200 characters'),
        href: z.string().trim().max(300),
        image: z.string(),
        position: z.number({ invalid_type_error: 'Enter a number' }).int().min(1, 'At least 1').max(200),
      })
    )
    .max(6, 'At most 6 tiles'),
  productInfo: z.object({
    warranty: z.string().trim().max(4000, 'At most 4000 characters'),
    deliveryReturns: z.string().trim().max(4000, 'At most 4000 characters'),
  }),
  about: z.object({
    hero: z.object({
      image: z.string(),
      title: z.string().trim().max(120, 'At most 120 characters'),
      text: z.string().trim().max(600, 'At most 600 characters'),
    }),
    quote: z.object({
      text: z.string().trim().max(300, 'At most 300 characters'),
      author: z.string().trim().max(120, 'At most 120 characters'),
    }),
    mission: z.object({
      image: z.string(),
      title: z.string().trim().max(120, 'At most 120 characters'),
      text: z.string().trim().max(1200, 'At most 1200 characters'),
    }),
    milestones: z
      .array(
        z.object({
          image: z.string(),
          title: z.string().trim().min(1, 'Title is required'),
          text: z.string().trim().max(600, 'At most 600 characters'),
        })
      )
      .max(6, 'At most 6 milestones'),
  }),
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
  home: {
    hero: {
      image: c?.home?.hero?.image ?? '',
      title: c?.home?.hero?.title ?? '',
      ctaLabel: c?.home?.hero?.ctaLabel ?? '',
      ctaHref: c?.home?.hero?.ctaHref ?? '',
    },
    tiles: c?.home?.tiles?.map((t) => ({ image: t.image, label: t.label, href: t.href })) ?? [],
    feature: {
      image: c?.home?.feature?.image ?? '',
      title: c?.home?.feature?.title ?? '',
      text: c?.home?.feature?.text ?? '',
      ctaLabel: c?.home?.feature?.ctaLabel ?? '',
      ctaHref: c?.home?.feature?.ctaHref ?? '',
    },
  },
  listingTiles: c?.listingTiles?.map((t) => ({ title: t.title, text: t.text ?? '', href: t.href ?? '', image: t.image ?? '', position: t.position ?? 4 })) ?? [],
  productInfo: { warranty: c?.productInfo?.warranty ?? '', deliveryReturns: c?.productInfo?.deliveryReturns ?? '' },
  about: {
    hero: { image: c?.about?.hero?.image ?? '', title: c?.about?.hero?.title ?? '', text: c?.about?.hero?.text ?? '' },
    quote: { text: c?.about?.quote?.text ?? '', author: c?.about?.quote?.author ?? '' },
    mission: { image: c?.about?.mission?.image ?? '', title: c?.about?.mission?.title ?? '', text: c?.about?.mission?.text ?? '' },
    milestones: c?.about?.milestones?.map((m) => ({ image: m.image ?? '', title: m.title, text: m.text ?? '' })) ?? [],
  },
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
  // zod already trimmed every text field
  home: v.home,
  about: v.about,
  productInfo: v.productInfo,
  listingTiles: v.listingTiles,
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

/** "home › tiles: At most 4 tiles" for the first invalid field, from react-hook-form's error tree. */
function firstErrorPath(errors: object, path: string[] = []): string {
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== 'object') continue;
    const here = [...path, /^\d+$/.test(key) ? `#${Number(key) + 1}` : key];
    if (typeof (value as { message?: unknown }).message === 'string') return `${here.join(' › ')}: ${(value as { message: string }).message}`;
    const deeper = firstErrorPath(value as object, here);
    if (deeper) return deeper;
  }
  return path.join(' › ');
}

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
        onSubmit={handleSubmit(
          (values) => updateMutation.mutate(toPayload(values)),
          // A blocked save says where, instead of doing nothing (the field error may be far down the page).
          (errors) => toast.error(`Can't save yet: check ${firstErrorPath(errors)}`)
        )}
        className="@container flex flex-col gap-8"
      >
        <HomeSection />
        <AboutSection />
        <ProductInfoSection />
        <ListingTilesSection />
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

function HomeSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContextTyped();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'home.tiles' });
  const imageInput = (name: 'home.hero.image' | 'home.feature.image', label: string, previewClassName: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ImageField label={label} value={field.value} onChange={field.onChange} previewClassName={previewClassName} />
      )}
    />
  );
  return (
    <VerticalFormBlockWrapper
      title="Home page"
      description="The hero at the top, the image tiles under Best Sellers and the feature block beside them. Links are storefront paths such as /shop?gender=women."
      className="max-w-none"
    >
      <div className="grid gap-6 @5xl:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-muted p-4">
          <Text className="font-medium">Hero</Text>
          {imageInput('home.hero.image', 'Image (wide; leave empty for a text-only hero)', 'aspect-[16/9] max-w-[420px]')}
          <Input
            label="Title"
            placeholder="Jewellery for every day"
            {...register('home.hero.title')}
            error={errors.home?.hero?.title?.message}
          />
          <div className="grid gap-3 @2xl:grid-cols-2">
            <Input
              label="Button label"
              placeholder="Shop new arrivals"
              {...register('home.hero.ctaLabel')}
              error={errors.home?.hero?.ctaLabel?.message}
            />
            <Input
              label="Button link"
              placeholder="/shop?tag=new-arrivals"
              {...register('home.hero.ctaHref')}
              error={errors.home?.hero?.ctaHref?.message}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-muted p-4">
          <Text className="font-medium">Feature block</Text>
          {imageInput('home.feature.image', 'Image', 'aspect-[4/3] max-w-[320px]')}
          <Input
            label="Title"
            placeholder="Made to be worn every day"
            {...register('home.feature.title')}
            error={errors.home?.feature?.title?.message}
          />
          <Textarea label="Text" rows={2} {...register('home.feature.text')} error={errors.home?.feature?.text?.message} />
          <div className="grid gap-3 @2xl:grid-cols-2">
            <Input
              label="Button label"
              placeholder="Shop new arrivals"
              {...register('home.feature.ctaLabel')}
              error={errors.home?.feature?.ctaLabel?.message}
            />
            <Input
              label="Button link"
              placeholder="/shop?tag=new-arrivals"
              {...register('home.feature.ctaHref')}
              error={errors.home?.feature?.ctaHref?.message}
            />
          </div>
        </div>
      </div>
      <Text className="font-medium">Image tiles</Text>
      <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
            <div className="flex items-center justify-between">
              <Text className="font-medium">Tile {index + 1}</Text>
              <RowActions index={index} count={fields.length} move={move} remove={remove} />
            </div>
            <Controller
              control={control}
              name={`home.tiles.${index}.image`}
              render={({ field: imageField }) => (
                <ImageField
                  value={imageField.value}
                  onChange={imageField.onChange}
                  previewClassName="aspect-[4/5] max-w-[220px]"
                  error={errors.home?.tiles?.[index]?.image?.message}
                />
              )}
            />
            <Input
              label="Label"
              placeholder="Shop Women"
              {...register(`home.tiles.${index}.label`)}
              error={errors.home?.tiles?.[index]?.label?.message}
            />
            <Input
              label="Link"
              placeholder="/shop?gender=women"
              {...register(`home.tiles.${index}.href`)}
              error={errors.home?.tiles?.[index]?.href?.message}
            />
          </div>
        ))}
      </div>
      {errors.home?.tiles?.message && <Text className="text-sm text-red-600">{errors.home.tiles.message}</Text>}
      {fields.length < 4 && (
        <Button type="button" variant="outline" className="w-fit" onClick={() => append({ image: '', label: '', href: '' })}>
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add tile
        </Button>
      )}
    </VerticalFormBlockWrapper>
  );
}

function AboutSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContextTyped();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'about.milestones' });
  const imageInput = (name: 'about.hero.image' | 'about.mission.image' | `about.milestones.${number}.image`, label: string, previewClassName: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <ImageField label={label} value={field.value} onChange={field.onChange} previewClassName={previewClassName} />}
    />
  );
  return (
    <VerticalFormBlockWrapper
      title="About page"
      description="The storefront's About page. Anything left empty is hidden; with nothing set the page shows a short default introduction."
      className={`max-w-none ${sectionClass}`}
    >
      <div className="grid gap-6 @5xl:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-muted p-4">
          <Text className="font-medium">Hero</Text>
          {imageInput('about.hero.image', 'Image (wide; leave empty for a text-only hero)', 'aspect-[16/9] max-w-[420px]')}
          <Input label="Title" placeholder="About Doreti" {...register('about.hero.title')} error={errors.about?.hero?.title?.message} />
          <Textarea label="Introduction" rows={3} {...register('about.hero.text')} error={errors.about?.hero?.text?.message} />
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-muted p-4">
          <Text className="font-medium">Mission</Text>
          {imageInput('about.mission.image', 'Image (optional)', 'aspect-square max-w-[260px]')}
          <Input label="Title" placeholder="Our promise" {...register('about.mission.title')} error={errors.about?.mission?.title?.message} />
          <Textarea label="Text" rows={4} {...register('about.mission.text')} error={errors.about?.mission?.text?.message} />
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-muted p-4">
        <Text className="font-medium">Quote (optional)</Text>
        <Textarea label="Quote" rows={2} {...register('about.quote.text')} error={errors.about?.quote?.text?.message} />
        <Input label="Attribution" placeholder="Name, role" {...register('about.quote.author')} error={errors.about?.quote?.author?.message} />
      </div>
      <Text className="font-medium">Milestones</Text>
      <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
            <div className="flex items-center justify-between">
              <Text className="font-medium">Milestone {index + 1}</Text>
              <RowActions index={index} count={fields.length} move={move} remove={remove} />
            </div>
            {imageInput(`about.milestones.${index}.image`, 'Image (optional)', 'aspect-square max-w-[220px]')}
            <Input label="Title" {...register(`about.milestones.${index}.title`)} error={errors.about?.milestones?.[index]?.title?.message} />
            <Textarea label="Text" rows={3} {...register(`about.milestones.${index}.text`)} error={errors.about?.milestones?.[index]?.text?.message} />
          </div>
        ))}
      </div>
      {errors.about?.milestones?.message && <Text className="text-sm text-red-600">{errors.about.milestones.message}</Text>}
      {fields.length < 6 && (
        <Button type="button" variant="outline" className="w-fit" onClick={() => append({ image: '', title: '', text: '' })}>
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add milestone
        </Button>
      )}
    </VerticalFormBlockWrapper>
  );
}

function ProductInfoSection() {
  const {
    register,
    formState: { errors },
  } = useFormContextTyped();
  const help = 'A blank line starts a new paragraph. **Bold** and [link text](/returns) work.';
  return (
    <VerticalFormBlockWrapper
      title="Product page"
      description="Blocks shown on every product page, beside the product's own details and size guide. Leave one empty to hide it; Delivery & Returns then shows the delivery settings instead."
      className={sectionClass}
    >
      <Textarea
        label="Warranty"
        rows={6}
        placeholder={'What the warranty covers, how long, and how to claim.\n\nThe warranty does not cover accidental damage. [Read the full warranty](/terms-of-service)'}
        helperText={help}
        {...register('productInfo.warranty')}
        error={errors.productInfo?.warranty?.message}
      />
      <Textarea
        label="Delivery & Returns"
        rows={6}
        placeholder={'**Standard delivery**\nLagos: 1–2 working days. Rest of Nigeria: 2–5 working days.\n\n**Returns**\nUnworn pieces within 7 days. [Returns policy](/returns)'}
        helperText={help}
        {...register('productInfo.deliveryReturns')}
        error={errors.productInfo?.deliveryReturns?.message}
      />
    </VerticalFormBlockWrapper>
  );
}

function ListingTilesSection() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContextTyped();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'listingTiles' });
  return (
    <VerticalFormBlockWrapper
      title="Shop page tiles"
      description="Offer tiles placed among the products on shop and collection pages, e.g. “Free delivery nationwide” after the 4th product. The image is optional."
      className={`max-w-none ${sectionClass}`}
    >
      <div className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-muted p-4">
            <div className="flex items-center justify-between">
              <Text className="font-medium">Tile {index + 1}</Text>
              <RowActions index={index} count={fields.length} move={move} remove={remove} />
            </div>
            <Input label="Title" placeholder="Free delivery nationwide" {...register(`listingTiles.${index}.title`)} error={errors.listingTiles?.[index]?.title?.message} />
            <Input label="Text (optional)" placeholder="On every order, to any state" {...register(`listingTiles.${index}.text`)} error={errors.listingTiles?.[index]?.text?.message} />
            <Input label="Link (optional)" placeholder="/shop?tag=new-arrivals" {...register(`listingTiles.${index}.href`)} />
            <Input
              type="number"
              label="After product number"
              {...register(`listingTiles.${index}.position`, { valueAsNumber: true })}
              error={errors.listingTiles?.[index]?.position?.message}
            />
            <Controller
              control={control}
              name={`listingTiles.${index}.image`}
              render={({ field: imageField }) => (
                <ImageField label="Image (optional)" value={imageField.value} onChange={imageField.onChange} previewClassName="aspect-[4/5] max-w-[200px]" />
              )}
            />
          </div>
        ))}
      </div>
      {errors.listingTiles?.message && <Text className="text-sm text-red-600">{errors.listingTiles.message}</Text>}
      {fields.length < 6 && (
        <Button type="button" variant="outline" className="w-fit" onClick={() => append({ title: '', text: '', href: '', image: '', position: 4 })}>
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add tile
        </Button>
      )}
    </VerticalFormBlockWrapper>
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
    <VerticalFormBlockWrapper
      title="Testimonials"
      description="Customer quotes on the home page, in this order."
      className={sectionClass}
    >
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
