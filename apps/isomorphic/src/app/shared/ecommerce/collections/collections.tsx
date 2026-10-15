'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActionIcon, Alert, Badge, Button, Input, Loader, Modal, MultiSelect, Select, Switch, Text, Textarea, Title, Tooltip } from 'rizzui';
import { PiArrowSquareOutBold, PiPencilBold, PiPlusBold, PiTrashBold, PiXBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import ImageField from '@/app/shared/content/image-field';
import { handleApiError } from '@/libs/axios';
import { useParentCategoryOptions } from '@/hooks/queries/useParentCategoryOptions';
import { useProducts as useMinimalProducts } from '@/hooks/queries/useReviews';
import {
  CollectionGroup,
  StoreCollection,
  StoreCollectionInput,
  useCreateCollection,
  useDeleteCollection,
  useStoreCollections,
  useUpdateCollection,
} from '@/hooks/queries/useCollections';

const GROUPS: { value: CollectionGroup; label: string }[] = [
  { value: 'collections', label: 'Collections' },
  { value: 'gifting', label: 'Gifting' },
  { value: 'men', label: 'Men' },
];
const groupLabel = (g: CollectionGroup) => GROUPS.find((x) => x.value === g)?.label ?? g;
const storefrontUrl = (process.env.NEXT_PUBLIC_STOREFRONT_URL ?? '').replace(/\/$/, '');

const optionalNumber = z.preprocess(
  (v) => (v === '' || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
  z.number().min(0, 'Must be 0 or more').optional()
);

const schema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(80, 'At most 80 characters'),
    slug: z.string().trim().max(80),
    description: z.string().trim().max(400, 'At most 400 characters'),
    image: z.string(),
    group: z.enum(['collections', 'gifting', 'men']),
    order: z.number({ invalid_type_error: 'Order must be a whole number' }).int().min(0),
    showInMenu: z.boolean(),
    active: z.boolean(),
    mode: z.enum(['manual', 'rules']),
    products: z.array(z.string()).max(200),
    categories: z.array(z.string()).max(20),
    tags: z.string(),
    specs: z.array(z.object({ key: z.string().trim(), values: z.string().trim() })).max(10),
    minPrice: optionalNumber,
    maxPrice: optionalNumber,
  })
  .refine((v) => v.mode !== 'manual' || v.products.length > 0, { path: ['products'], message: 'Pick at least one product' })
  .refine((v) => v.minPrice === undefined || v.maxPrice === undefined || v.minPrice <= v.maxPrice, {
    path: ['maxPrice'],
    message: 'Must be at least the minimum price',
  });

type FormValues = z.infer<typeof schema>;
const splitList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const toFormValues = (c?: StoreCollection, nextOrder = 0): FormValues => ({
  title: c?.title ?? '',
  slug: c?.slug ?? '',
  description: c?.description ?? '',
  image: c?.image ?? '',
  group: c?.group ?? 'collections',
  order: c?.order ?? nextOrder,
  showInMenu: c?.showInMenu ?? true,
  active: c?.active ?? true,
  mode: c?.mode ?? 'rules',
  products: (c?.products ?? []).map(String),
  categories: (c?.rules?.categories ?? []).map(String),
  tags: (c?.rules?.tags ?? []).join(', '),
  specs: (c?.rules?.specs ?? []).map((s) => ({ key: s.key, values: s.values.join(', ') })),
  minPrice: c?.rules?.minPrice,
  maxPrice: c?.rules?.maxPrice,
});

const toPayload = (v: FormValues): StoreCollectionInput => ({
  title: v.title,
  ...(v.slug ? { slug: v.slug } : {}),
  description: v.description,
  image: v.image,
  group: v.group,
  order: v.order,
  showInMenu: v.showInMenu,
  active: v.active,
  mode: v.mode,
  products: v.mode === 'manual' ? v.products : [],
  rules: {
    categories: v.mode === 'rules' ? v.categories : [],
    tags: v.mode === 'rules' ? splitList(v.tags).map((t) => t.toLowerCase()) : [],
    specs: v.mode === 'rules' ? v.specs.filter((s) => s.key && splitList(s.values).length).map((s) => ({ key: s.key, values: splitList(s.values) })) : [],
    minPrice: v.mode === 'rules' ? (v.minPrice ?? null) : null,
    maxPrice: v.mode === 'rules' ? (v.maxPrice ?? null) : null,
  },
});

/** What a rules collection matches, in words. */
function ruleSummary(c: StoreCollection, categoryName: (id: string) => string) {
  if (c.mode === 'manual') return `${c.products.length} hand-picked product${c.products.length === 1 ? '' : 's'}`;
  const r = c.rules ?? { categories: [], tags: [], specs: [] };
  const parts = [
    r.categories?.length ? `in ${r.categories.map(categoryName).join(' or ')}` : '',
    r.tags?.length ? `tagged ${r.tags.join(' or ')}` : '',
    ...(r.specs ?? []).map((s) => `${s.key}: ${s.values.join(' or ')}`),
    typeof r.minPrice === 'number' ? `from ₦${r.minPrice.toLocaleString()}` : '',
    typeof r.maxPrice === 'number' ? `up to ₦${r.maxPrice.toLocaleString()}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : 'No rules yet';
}

export default function Collections() {
  const { data: collections = [], isLoading, error } = useStoreCollections();
  const { data: categoryOptions } = useParentCategoryOptions();
  const [editing, setEditing] = useState<StoreCollection | 'new' | null>(null);
  const update = useUpdateCollection();
  const { mutate: remove } = useDeleteCollection();
  const nextOrder = collections.length ? Math.max(...collections.map((c) => c.order ?? 0)) + 1 : 0;
  const categoryName = (id: string) => categoryOptions.find((o) => o.value === id)?.label ?? 'a deleted category';

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load collections</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text className="max-w-3xl text-gray-500">
          Collections appear in the storefront menu under their group (Collections, Gifting or Men) and open as a product list with filters.
          Pick products by hand, or set rules such as a price range (&ldquo;Gifts under ₦50k&rdquo;), a material or a category. Best Sellers, New
          Arrivals and Back in Stock are built in.
        </Text>
        <Button onClick={() => setEditing('new')}>
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add collection
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-muted py-16">
          <Title as="h5">No collections yet</Title>
          <Text className="text-gray-500">Start with a gift guide or a material, e.g. &ldquo;Gifts under ₦50k&rdquo; or &ldquo;925 Sterling Silver&rdquo;.</Text>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-100">
              <tr>
                <th className="w-16 px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Collection</th>
                <th className="px-4 py-3 font-medium">Menu group</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c._id} className="border-t border-muted align-top">
                  <td className="px-4 py-3 text-gray-600">{c.order}</td>
                  <td className="px-4 py-3">
                    <Text className="font-medium">{c.title}</Text>
                    <Text className="text-xs text-gray-500">/shop?tag={c.slug}</Text>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="flat" size="sm">
                      {groupLabel(c.group)}
                    </Badge>
                    {!c.showInMenu && <Text className="mt-1 text-xs text-gray-500">Not in the menu</Text>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ruleSummary(c, categoryName)}</td>
                  <td className="px-4 py-3">
                    <Switch
                      aria-label={`${c.title} active`}
                      checked={c.active}
                      disabled={update.isPending}
                      onChange={(e) => update.mutate({ id: c._id, data: { active: e.target.checked } })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {storefrontUrl && (
                        <Tooltip content="View on the storefront" placement="top">
                          <a href={`${storefrontUrl}/shop?tag=${c.slug}`} target="_blank" rel="noreferrer" aria-label="View on the storefront">
                            <ActionIcon size="sm" variant="outline" as="span">
                              <PiArrowSquareOutBold className="h-4 w-4" />
                            </ActionIcon>
                          </a>
                        </Tooltip>
                      )}
                      <Tooltip content="Edit" placement="top">
                        <ActionIcon size="sm" variant="outline" onClick={() => setEditing(c)} aria-label="Edit collection">
                          <PiPencilBold className="h-4 w-4" />
                        </ActionIcon>
                      </Tooltip>
                      <DeletePopover title="Delete collection" description={`Delete "${c.title}"? Its products are not affected.`} onDelete={() => remove(c._id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} size="xl">
        {editing !== null && <CollectionForm collection={editing === 'new' ? undefined : editing} nextOrder={nextOrder} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function CollectionForm({ collection, nextOrder, onDone }: { collection?: StoreCollection; nextOrder: number; onDone: () => void }) {
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(collection, nextOrder) });
  const specs = useFieldArray({ control, name: 'specs' });
  const createMutation = useCreateCollection(onDone);
  const updateMutation = useUpdateCollection(onDone);
  const { data: products = [], isLoading: productsLoading } = useMinimalProducts();
  const { data: categoryOptions, isLoading: categoriesLoading } = useParentCategoryOptions();
  const mode = watch('mode');
  const productOptions = products.map((p) => ({ value: p._id, label: `${p.name} (SKU ${p.sku})` }));

  const onSubmit = (values: FormValues) => {
    const payload = toPayload(values);
    if (collection) updateMutation.mutate({ id: collection._id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {collection ? 'Edit collection' : 'New collection'}
        </Title>
        <ActionIcon size="sm" variant="text" onClick={onDone} aria-label="Close">
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Title" placeholder="Gifts under ₦50k" {...register('title')} error={errors.title?.message} />
        <Input
          label="Link (optional)"
          placeholder="gifts-under-50k"
          helperText="Made from the title when empty."
          {...register('slug')}
          error={errors.slug?.message}
        />
      </div>
      <Textarea label="Description (optional)" rows={2} {...register('description')} error={errors.description?.message} />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
        <Controller
          control={control}
          name="image"
          render={({ field }) => <ImageField label="Image (optional)" value={field.value} onChange={field.onChange} previewClassName="aspect-square max-w-[200px]" />}
        />
        <div className="grid content-start gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="group"
            render={({ field }) => (
              <Select
                label="Menu group"
                options={GROUPS}
                value={GROUPS.find((g) => g.value === field.value) ?? null}
                onChange={(option: { value: CollectionGroup }) => field.onChange(option.value)}
                inPortal={false}
              />
            )}
          />
          <Input type="number" label="Order" helperText="Lower numbers come first." {...register('order', { valueAsNumber: true })} error={errors.order?.message} />
          <Controller
            control={control}
            name="showInMenu"
            render={({ field }) => <Switch label="Show in the menu" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
          />
          <Controller
            control={control}
            name="active"
            render={({ field }) => <Switch label={field.value ? 'Active' : 'Hidden'} checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-muted p-4">
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {(['rules', 'manual'] as const).map((m) => (
                <Button key={m} type="button" size="sm" variant={field.value === m ? 'solid' : 'outline'} onClick={() => field.onChange(m)}>
                  {m === 'rules' ? 'Match by rules' : 'Pick products'}
                </Button>
              ))}
            </div>
          )}
        />

        {mode === 'manual' ? (
          <Controller
            control={control}
            name="products"
            render={({ field }) => (
              <MultiSelect
                label="Products, in this order"
                options={productOptions}
                value={field.value}
                onChange={(value: string[]) => field.onChange(value)}
                searchable
                hideSelectedOptions={false}
                disabled={productsLoading}
                placeholder={productsLoading ? 'Loading products…' : 'Pick products…'}
                error={errors.products?.message}
                inPortal={false}
              />
            )}
          />
        ) : (
          <>
            <Text className="text-sm text-gray-500">Active products matching every rule you set are included, newest first. Leave a rule empty to skip it.</Text>
            <Controller
              control={control}
              name="categories"
              render={({ field }) => (
                <MultiSelect
                  label="In these categories (and their subcategories)"
                  options={categoryOptions}
                  value={field.value}
                  onChange={(value: string[]) => field.onChange(value)}
                  searchable
                  hideSelectedOptions={false}
                  disabled={categoriesLoading}
                  placeholder="Any category"
                  inPortal={false}
                />
              )}
            />
            <Input label="Tagged (comma-separated)" placeholder="women, bridal" {...register('tags')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="number" label="Minimum price (₦)" {...register('minPrice')} error={errors.minPrice?.message} />
              <Input type="number" label="Maximum price (₦)" placeholder="50000" {...register('maxPrice')} error={errors.maxPrice?.message} />
            </div>
            <div className="flex flex-col gap-2">
              <Text className="text-sm font-medium">Specifications</Text>
              {specs.fields.map((f, i) => (
                <div key={f.id} className="flex items-start gap-2">
                  <Input className="flex-1" placeholder="Material" {...register(`specs.${i}.key`)} />
                  <Input className="flex-[2]" placeholder="925 Sterling Silver, Freshwater Pearl" {...register(`specs.${i}.values`)} />
                  <ActionIcon variant="flat" color="danger" onClick={() => specs.remove(i)} aria-label="Remove specification">
                    <PiTrashBold className="h-4 w-4" />
                  </ActionIcon>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" className="w-fit" onClick={() => specs.append({ key: '', values: '' })}>
                <PiPlusBold className="me-1.5 h-4 w-4" />
                Add specification
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
          {collection ? 'Save collection' : 'Create collection'}
        </Button>
      </div>
    </form>
  );
}
