'use client';

import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { MultiSelect } from 'rizzui';
import { useProducts as useMinimalProducts } from '@/hooks/queries/useReviews';
import { UpdateStoreSettingsInput } from '@/validators/update-store-settings.schema';

const MAX_PICKS = 50;

/**
 * Products that fill the storefront's Best Sellers list (and get its badge) until real sales
 * rank enough of them. Sold products always come first; picks fill the remaining slots in order.
 */
export default function BestSellerPicksField() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<UpdateStoreSettingsInput>();
  const { data: products = [], isLoading } = useMinimalProducts();
  const picked = watch('bestSellerPicks');

  const options = useMemo(() => {
    const list = products.map((p) => ({ value: p._id, label: `${p.name} (SKU ${p.sku})` }));
    // The list only has active products; keep picked ones that are no longer active visible.
    (picked ?? []).forEach((id) => {
      if (!list.some((o) => o.value === id)) list.push({ value: id, label: `Inactive or deleted product (${id})` });
    });
    return list;
  }, [products, picked]);

  return (
    <Controller
      name="bestSellerPicks"
      control={control}
      render={({ field }) => (
        <MultiSelect
          label="Best seller picks"
          className="mt-5"
          options={options}
          value={field.value ?? []}
          onChange={(value: string[]) => field.onChange(value.slice(0, MAX_PICKS))}
          searchable
          hideSelectedOptions={false}
          disabled={isLoading}
          placeholder={isLoading ? 'Loading products…' : 'Pick products to show as best sellers…'}
          helperText="Fills the Best Sellers list while sales are few. Products that actually sell come first; these fill the remaining places, in the order picked."
          error={errors.bestSellerPicks?.message as string}
          inPortal={false}
        />
      )}
    />
  );
}
