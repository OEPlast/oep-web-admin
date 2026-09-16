'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input, Select } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
];

interface ProductIdentifiersProps {
  className?: string;
}

/**
 * Brand, GTIN and MPN let Google match the product to its catalogue (Shopping listings and rich
 * results). Leave GTIN empty for own-brand or handmade items; the feed then reports that the
 * product has no identifier rather than guessing one.
 */
export default function ProductIdentifiers({ className }: ProductIdentifiersProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <FormGroup
      title="Product Identifiers"
      description="Used by Google Shopping and search results. SKU is set in Summary."
      className={cn(className)}
    >
      <Input
        label="Brand"
        placeholder="e.g. Samsung (leave empty for your own products)"
        {...register('brand')}
        error={errors.brand?.message as string}
      />
      <Input
        label="GTIN (barcode number)"
        placeholder="e.g. 5901234123457"
        inputMode="numeric"
        helperText="The number under the barcode: EAN-13, UPC-12, GTIN-14 or EAN-8."
        {...register('gtin')}
        error={errors.gtin?.message as string}
      />
      <Input
        label="MPN (manufacturer part number)"
        placeholder="Optional"
        {...register('mpn')}
        error={errors.mpn?.message as string}
      />
      <Controller
        name="condition"
        control={control}
        render={({ field }) => (
          <Select
            label="Condition"
            options={conditionOptions}
            value={field.value}
            onChange={field.onChange}
            getOptionValue={(option) => option.value}
            displayValue={(selected: string) => conditionOptions.find((o) => o.value === selected)?.label ?? 'New'}
          />
        )}
      />
    </FormGroup>
  );
}
