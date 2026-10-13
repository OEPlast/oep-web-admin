'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { ActionIcon, Button, Checkbox, Input } from 'rizzui';
import cn from '@core/utils/class-names';
import TrashIcon from '@core/components/icons/trash';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import { formatToNaira } from '@/libs/currencyFormatter';

type Option = { name: string; value: string };
type Row = { key?: string; options: Option[]; price?: number; stock: number; sku?: string };
type Group = { name: string; values: string[] };
type AttributeInput = { name?: string; children?: Array<{ name?: string; price?: number }> };

/** Main-server takes at most this many combinations per product. */
const MAX_COMBINATIONS = 300;

/** Same identity as Main-server's `variantKey`: group order doesn't matter. */
const keyOf = (options: Option[]) =>
  [...options]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((o) => `${o.name}=${o.value}`)
    .join('|');

/** Every combination of one value from each group: Metal × Size → Gold/6, Gold/7, Silver/6… */
const combine = (groups: Group[]): Option[][] =>
  groups.reduce<Option[][]>(
    (rows, group) => rows.flatMap((row) => group.values.map((value) => [...row, { name: group.name, value }])),
    [[]]
  );

const isPrice = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Price and stock per combination of options (e.g. Gold + size 7 → ₦85,000, 2 in stock). Built
 * from the option groups above; only the combinations listed here can be bought.
 */
export default function ProductCombinations({ className }: { className?: string }) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const { fields, replace, remove } = useFieldArray({ control, name: 'variants' });

  const watchedAttributes: AttributeInput[] | undefined = watch('attributes');
  const attributes = useMemo(() => watchedAttributes ?? [], [watchedAttributes]);
  const variants: Row[] = watch('variants') || [];
  const productPrice = Number(watch('price')) || 0;

  const groups: Group[] = useMemo(
    () =>
      attributes
        .map((a) => ({
          name: a?.name?.trim() ?? '',
          values: Array.from(new Set((a?.children ?? []).map((c) => c?.name?.trim() ?? '').filter(Boolean))),
        }))
        .filter((g) => g.name && g.values.length),
    [attributes]
  );

  // The groups the saved combinations use; otherwise every group.
  const usedGroups = variants[0]?.options?.map((o) => o.name) ?? [];
  const [chosen, setChosen] = useState<string[]>(usedGroups);
  const usedKey = usedGroups.join('|');
  useEffect(() => {
    if (usedKey) setChosen(usedKey.split('|'));
  }, [usedKey]);
  const pickedGroups = groups.filter((g) => (chosen.length ? chosen.includes(g.name) : true));

  const possible = useMemo(() => (pickedGroups.length ? combine(pickedGroups) : []), [pickedGroups]);
  const listed = new Set(variants.map((v) => keyOf(v.options ?? [])));
  const newCount = possible.filter((o) => !listed.has(keyOf(o))).length;
  const isValid = (v: Row) => (v.options ?? []).every((o) => groups.find((g) => g.name === o.name)?.values.includes(o.value));
  const staleCount = variants.filter((v) => !isValid(v)).length;

  // The product's stock is the combinations' total (Main-server sets it the same way on save).
  const total = variants.reduce((sum, v) => sum + (isPrice(v?.stock) ? v.stock : 0), 0);
  useEffect(() => {
    if (fields.length) setValue('stock', total, { shouldDirty: true });
  }, [total, fields.length, setValue]);

  /** Lists every combination of the chosen groups, keeping what was already entered. */
  const build = () => {
    const before = new Map(variants.map((v) => [keyOf(v.options ?? []), v]));
    replace(
      possible.map((options) => {
        const prev = before.get(keyOf(options));
        return { options, stock: prev?.stock ?? 0, price: prev?.price, sku: prev?.sku ?? '' };
      })
    );
  };

  /** What a combination costs without its own price: the first priced option, else the product. */
  const fallbackPrice = (options: Option[]) => {
    for (const group of attributes) {
      const picked = options.find((o) => o.name === group?.name?.trim());
      const child = picked && group?.children?.find((c) => c?.name?.trim() === picked.value);
      if (isPrice(child?.price)) return child.price;
    }
    return productPrice;
  };

  const [bulkStock, setBulkStock] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const applyToAll = (field: 'stock' | 'price', raw: string) => {
    const value = raw === '' ? undefined : Number(raw);
    if (field === 'stock' && (value === undefined || !Number.isInteger(value) || value < 0)) return;
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) return;
    fields.forEach((_, i) => setValue(`variants.${i}.${field}`, value, { shouldDirty: true, shouldValidate: true }));
  };

  const toggleGroup = (name: string) =>
    setChosen((prev) => {
      const base = prev.length ? prev : groups.map((g) => g.name);
      return base.includes(name) ? base.filter((n) => n !== name) : [...base, name];
    });

  return (
    <VerticalFormBlockWrapper
      title="Combinations"
      description="Give each combination of options its own price and stock, e.g. Gold + size 7 → ₦85,000, 2 in stock. Only the combinations listed here can be bought."
      className={cn(className, 'w-full max-w-none')}
    >
      <div className="col-span-full space-y-4">
        {groups.length === 0 ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-gray-500">
            Add option groups (e.g. Metal and Size) under Variant Options first.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Combine:</span>
              {groups.map((g) => (
                <Checkbox
                  key={g.name}
                  label={`${g.name} (${g.values.length})`}
                  checked={pickedGroups.some((p) => p.name === g.name)}
                  onChange={() => toggleGroup(g.name)}
                  disabled={fields.length > 0}
                />
              ))}
              <span className="text-sm text-gray-500">= {possible.length} combinations</span>
            </div>

            {fields.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <p className="text-sm text-gray-600">
                  Off: stock and prices come from the product and the single options above.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  disabled={!possible.length || possible.length > MAX_COMBINATIONS}
                  onClick={build}
                >
                  Create {possible.length} combinations
                </Button>
                {possible.length > MAX_COMBINATIONS && (
                  <p className="mt-2 text-sm text-red-600">
                    That&apos;s more than {MAX_COMBINATIONS}. Combine fewer groups.
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                  While combinations are on, the stock on each single option above is ignored and the
                  product&apos;s stock is their total: <strong>{total}</strong>. Leave a price empty to use
                  the option or product price. Delete a row to stop selling that combination.
                </div>

                {(newCount > 0 || staleCount > 0) && (
                  <div className="flex flex-wrap items-center gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    <span>
                      {newCount > 0 && `${newCount} combination${newCount === 1 ? '' : 's'} not listed yet. `}
                      {staleCount > 0 && `${staleCount} use${staleCount === 1 ? 's' : ''} an option that no longer exists (saving will fail).`}
                    </span>
                    <Button type="button" size="sm" variant="outline" onClick={build}>
                      Update list
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap items-end gap-3">
                  <Input
                    size="sm"
                    type="number"
                    min="0"
                    label="Stock for all"
                    placeholder="0"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                    className="w-32"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => applyToAll('stock', bulkStock)}>
                    Apply
                  </Button>
                  <Input
                    size="sm"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="&#8358;"
                    label="Price for all"
                    placeholder="Empty clears"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-40"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => applyToAll('price', bulkPrice)}>
                    Apply
                  </Button>
                  <Button type="button" size="sm" variant="text" className="ms-auto text-red-600" onClick={() => replace([])}>
                    Turn off combinations
                  </Button>
                </div>

                <div className="grid grid-cols-12 gap-3 border-b pb-2 text-xs font-medium uppercase text-gray-500">
                  <span className="col-span-4">Combination</span>
                  <span className="col-span-2">Stock</span>
                  <span className="col-span-3">Price</span>
                  <span className="col-span-2">SKU</span>
                </div>
                {fields.map((field, i) => {
                  const row = variants[i];
                  const options = row?.options ?? [];
                  const rowErrors = (errors.variants as any)?.[i];
                  return (
                    <div key={field.id} className="grid grid-cols-12 items-start gap-3">
                      <div className={cn('col-span-4 pt-1.5 text-sm', row && !isValid(row) && 'text-red-600 line-through')}>
                        {options.map((o) => o.value).join(' · ')}
                        <span className="block text-xs text-gray-400">{options.map((o) => o.name).join(' · ')}</span>
                      </div>
                      <Input
                        size="sm"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="col-span-2"
                        {...register(`variants.${i}.stock`, { valueAsNumber: true })}
                        error={rowErrors?.stock?.message}
                      />
                      <Input
                        size="sm"
                        type="number"
                        min="0"
                        step="0.01"
                        prefix="&#8358;"
                        className="col-span-3"
                        placeholder={`${fallbackPrice(options)}`}
                        {...register(`variants.${i}.price`, { valueAsNumber: true })}
                        error={rowErrors?.price?.message}
                        helperText={!isPrice(row?.price) ? `Uses ${formatToNaira(fallbackPrice(options))}` : ''}
                      />
                      <Input size="sm" placeholder="Optional" className="col-span-2" {...register(`variants.${i}.sku`)} />
                      <ActionIcon
                        type="button"
                        size="sm"
                        variant="flat"
                        className="col-span-1"
                        aria-label={`Stop selling ${options.map((o) => o.value).join(' / ')}`}
                        onClick={() => remove(i)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </ActionIcon>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </VerticalFormBlockWrapper>
  );
}
