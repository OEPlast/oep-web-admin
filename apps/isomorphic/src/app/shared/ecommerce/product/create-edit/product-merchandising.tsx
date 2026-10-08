'use client';

import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { MultiSelect, Select } from 'rizzui';
import cn from '@core/utils/class-names';
import { hasFeature } from '@/config/features';
import FormGroup from '@/app/shared/form-group';
import { useProducts as useMinimalProducts } from '@/hooks/queries/useReviews';
import { useSizeChartOptions } from '@/hooks/queries/useContent';
import { CreateProductInput } from '@/validators/product-schema';

const MAX_ADD_ONS = 10;

interface ProductMerchandisingProps {
  className?: string;
  /** The product being edited, so it can't be picked as its own add-on. */
  productId?: string;
}

/**
 * Add-ons offered on the product page and the size chart. Both are optional: with nothing picked
 * the storefront falls back to add-on categories and the category's size chart.
 */
export default function ProductMerchandising({ className, productId }: ProductMerchandisingProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<CreateProductInput>();

  const { data: products = [], isLoading: productsLoading } = useMinimalProducts();
  const watchedAddOns = watch('addOns');
  const addOnOptions = useMemo(() => {
    const selectedAddOns = watchedAddOns ?? [];
    const options = products
      .filter((p) => p._id !== productId)
      .map((p) => ({ value: p._id, label: `${p.name} (SKU ${p.sku})` }));
    // The list only has active products; keep picked ones that are no longer active visible.
    selectedAddOns.forEach((id) => {
      if (!options.some((o) => o.value === id)) options.push({ value: id, label: `Inactive or deleted product (${id})` });
    });
    return options;
  }, [products, productId, watchedAddOns]);

  const currentSizeChart = watch('sizeChart');
  const { options: chartOptions, isLoading: chartsLoading } = useSizeChartOptions(currentSizeChart);
  const sizeChartOptions = [{ value: '', label: "Use the category's size chart" }, ...chartOptions];

  return (
    <FormGroup
      title="Add-ons & Size Chart"
      description="Products suggested alongside this one (e.g. a gift box), and the size guide shown on its page."
      className={cn(className)}
    >
      <Controller
        name="addOns"
        control={control}
        render={({ field }) => (
          <MultiSelect
            label="Add-ons"
            className="col-span-full"
            options={addOnOptions}
            value={field.value ?? []}
            onChange={(value: string[]) => field.onChange(value.slice(0, MAX_ADD_ONS))}
            searchable
            hideSelectedOptions={false}
            disabled={productsLoading}
            placeholder={productsLoading ? 'Loading products…' : 'Pick products to offer with this one…'}
            helperText={`Up to ${MAX_ADD_ONS}, shown in the order picked. Leave empty to suggest products from add-on categories.`}
            error={errors.addOns?.message as string}
            inPortal={false}
          />
        )}
      />

      <Controller
        name="sizeChart"
        control={control}
        render={({ field }) => (
          <Select
            label="Size chart"
            options={sizeChartOptions}
            value={sizeChartOptions.find((o) => o.value === (field.value ?? '')) ?? null}
            onChange={(value: string) => field.onChange(value)}
            getOptionValue={(o) => o.value}
            getOptionDisplayValue={(o) => o.label}
            disabled={chartsLoading}
            helperText={hasFeature('content') ? 'Size charts are managed under Storefront content.' : undefined}
            error={errors.sizeChart?.message as string}
          />
        )}
      />
    </FormGroup>
  );
}
