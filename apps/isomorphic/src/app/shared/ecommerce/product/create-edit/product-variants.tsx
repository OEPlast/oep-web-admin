'use client';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Input, Button, ActionIcon, Select } from 'rizzui';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import TrashIcon from '@core/components/icons/trash';
import { PiPlusBold } from 'react-icons/pi';
import { useState } from 'react';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';

export default function ProductVariants({ className }: { className?: string }) {
  const { control, register, watch, formState: { errors } } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attributes',
  });

  const addVariant = () => {
    append({
      name: '',
      children: [],
    });
  };

  return (
    <VerticalFormBlockWrapper
      title="Product Variants (Attributes)"
      description="Define product variations with their own pricing, stock, and images"
      className={cn(className, 'w-full max-w-none')}
    >
      {fields.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500 border border-dashed rounded-lg">
          <p>No variants added yet</p>
          <p className="text-sm mt-2">Click "Add Variant" to create product variations like Color, Size, etc.</p>
        </div>
      )}

      {fields.map((item, index) => (
        <div key={item.id} className="col-span-full border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900">Variant #{index + 1}</h4>
            <ActionIcon
              onClick={() => remove(index)}
              variant="flat"
              color="danger"
              className="shrink-0"
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Variant Name"
              placeholder="e.g. Color, Size, Material"
              {...register(`attributes.${index}.name`)}
              error={(errors.attributes as any)?.[index]?.name?.message}
              helperText="The attribute name (e.g., 'Color' for red, blue, green)"
            />
          </div>

          <VariantChildren attributeIndex={index} />
        </div>
      ))}

      <Button
        type="button"
        onClick={addVariant}
        variant="outline"
        className="col-span-full ml-auto w-auto"
      >
        <PiPlusBold className="me-2 h-4 w-4" /> Add Variant
      </Button>
    </VerticalFormBlockWrapper>
  );
}

function VariantChildren({ attributeIndex }: { attributeIndex: number }) {
  const { control, register, watch, formState: { errors } } = useFormContext();
  const [showChildren, setShowChildren] = useState(true);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `attributes.${attributeIndex}.children`,
  });

  const productPrice = watch('price') || 0;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">
          Sub-Variants (Optional)
        </label>
        <Button
          type="button"
          size="sm"
          variant="text"
          onClick={() => setShowChildren(!showChildren)}
        >
          {showChildren ? 'Hide' : 'Show'} Sub-Variants
        </Button>
      </div>

      {showChildren && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 px-2">
            <div className="col-span-3">Value</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Color Code</div>
            <div className="col-span-2">Pricing Tiers</div>
            <div className="col-span-1"></div>
          </div>

          {fields.map((child, childIndex) => (
            <VariantChildRow
              key={child.id}
              attributeIndex={attributeIndex}
              childIndex={childIndex}
              productPrice={productPrice}
              onRemove={() => remove(childIndex)}
            />
          ))}

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ 
              name: '', 
              price: undefined,
              stock: 0,
              colorCode: '',
              pricingTiers: []
            })}
            className="w-full"
          >
            <PiPlusBold className="me-2 h-3 w-3" /> Add Value
          </Button>

          {fields.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4 border border-dashed rounded">
              No sub-variants yet. Add values like "Red", "Blue" for Color or "Small", "Medium" for Size.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function VariantChildRow({ 
  attributeIndex, 
  childIndex, 
  productPrice,
  onRemove 
}: { 
  attributeIndex: number; 
  childIndex: number; 
  productPrice: number;
  onRemove: () => void;
}) {
  const { control, register, watch, formState: { errors } } = useFormContext();
  const [showPricingTiers, setShowPricingTiers] = useState(false);

  const childPrice = watch(`attributes.${attributeIndex}.children.${childIndex}.price`);
  const pricingTiers = watch(`attributes.${attributeIndex}.children.${childIndex}.pricingTiers`) || [];
  const tierCount = pricingTiers.length;
  const effectivePrice = childPrice !== undefined && childPrice !== null && childPrice !== '' ? childPrice : productPrice;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-3">
          <Input
            size="sm"
            placeholder="e.g. Small, Red, Cotton"
            {...register(`attributes.${attributeIndex}.children.${childIndex}.name`)}
            error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.name?.message}
          />
        </div>
        
        <div className="col-span-2">
          <Input
            size="sm"
            type="number"
            placeholder="0"
            min="0"
            {...register(`attributes.${attributeIndex}.children.${childIndex}.stock`, { valueAsNumber: true })}
            error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.stock?.message}
          />
        </div>

        <div className="col-span-2">
          <Input
            size="sm"
            type="number"
            step="0.01"
            placeholder={`${productPrice}`}
            prefix="$"
            {...register(`attributes.${attributeIndex}.children.${childIndex}.price`, { valueAsNumber: true })}
            error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.price?.message}
            helperText={!childPrice ? `Uses parent: $${productPrice}` : ''}
          />
        </div>

        <div className="col-span-2">
          <Input
            size="sm"
            placeholder="#FF5733"
            {...register(`attributes.${attributeIndex}.children.${childIndex}.colorCode`)}
            error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.colorCode?.message}
            prefix={
              watch(`attributes.${attributeIndex}.children.${childIndex}.colorCode`) ? (
                <div 
                  className="w-4 h-4 rounded border border-gray-300" 
                  style={{ 
                    backgroundColor: watch(`attributes.${attributeIndex}.children.${childIndex}.colorCode`) || 'transparent'
                  }}
                />
              ) : null
            }
          />
        </div>

        <div className="col-span-2">
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPricingTiers(!showPricingTiers)}
              className="w-full text-xs"
            >
              {showPricingTiers ? 'Hide' : 'Show'} Tiers
            </Button>
            {tierCount >= 1 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                {tierCount}
              </span>
            )}
          </div>
        </div>

        <div className="col-span-1 flex justify-end">
          <ActionIcon
            onClick={onRemove}
            variant="flat"
            size="sm"
          >
            <TrashIcon className="h-3 w-3" />
          </ActionIcon>
        </div>
      </div>

      {showPricingTiers && (
        <div className="ml-4 pl-4 border-l-2 border-gray-200">
          <PricingTiers 
            attributeIndex={attributeIndex} 
            childIndex={childIndex}
            basePrice={effectivePrice}
          />
        </div>
      )}
    </div>
  );
}

function PricingTiers({ 
  attributeIndex, 
  childIndex,
  basePrice 
}: { 
  attributeIndex: number; 
  childIndex: number;
  basePrice: number;
}) {
  const { control, register, watch, formState: { errors } } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `attributes.${attributeIndex}.children.${childIndex}.pricingTiers`,
  });

  return (
    <div className="space-y-3 py-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-medium text-gray-700">Wholesale Pricing Tiers</h5>
        <span className="text-xs text-gray-500">
          Base price: {isNaN(basePrice) || !basePrice ? 'Not set' : `$${basePrice.toFixed(2)}`}
        </span>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-gray-500 py-2">No pricing tiers. Add tiers for wholesale/bulk pricing.</p>
      )}

      {fields.map((tier, tierIndex) => (
        <div key={tier.id} className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-2">
            <Input
              size="sm"
              type="number"
              placeholder="Min"
              min="1"
              {...register(`attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.minQty`, { valueAsNumber: true })}
              error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.pricingTiers?.[tierIndex]?.minQty?.message}
            />
          </div>

          <div className="col-span-2">
            <Input
              size="sm"
              type="number"
              placeholder="Max"
              min="1"
              {...register(`attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.maxQty`, { valueAsNumber: true })}
              error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.pricingTiers?.[tierIndex]?.maxQty?.message}
            />
          </div>

          <div className="col-span-3">
            <Controller
              name={`attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.strategy`}
              control={control}
              render={({ field }) => (
                <Select
                  size="sm"
                  options={[
                    { value: 'fixedPrice', label: 'Fixed Price' },
                    { value: 'percentOff', label: 'Percent Off' },
                    { value: 'amountOff', label: 'Amount Off' },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Strategy"
                  error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.pricingTiers?.[tierIndex]?.strategy?.message}
                />
              )}
            />
          </div>

          <div className="col-span-2">
            <Input
              size="sm"
              type="number"
              step="0.01"
              placeholder="Value"
              {...register(`attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.value`, { valueAsNumber: true })}
              error={(errors.attributes as any)?.[attributeIndex]?.children?.[childIndex]?.pricingTiers?.[tierIndex]?.value?.message}
            />
          </div>

          <div className="col-span-2">
            <TierCalculatedPrice
              strategy={watch(`attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.strategy`)}
              value={watch(`attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.value`)}
              basePrice={basePrice}
            />
          </div>

          <div className="col-span-1 flex justify-end">
            <ActionIcon
              onClick={() => remove(tierIndex)}
              variant="flat"
              size="sm"
            >
              <TrashIcon className="h-3 w-3" />
            </ActionIcon>
          </div>
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => append({ 
          minQty: 1, 
          maxQty: undefined, 
          strategy: 'fixedPrice', 
          value: basePrice 
        })}
        className="w-full"
      >
        <PiPlusBold className="me-1 h-3 w-3" /> Add Tier
      </Button>
    </div>
  );
}

function TierCalculatedPrice({ 
  strategy, 
  value, 
  basePrice 
}: { 
  strategy: string; 
  value: number; 
  basePrice: number;
}) {
  // Check if we have valid data
  if (!strategy || value === undefined || value === null || isNaN(value)) {
    return <span className="text-xs text-gray-400">-</span>;
  }

  // Check if basePrice is valid
  if (isNaN(basePrice) || basePrice === undefined || basePrice === null) {
    return <span className="text-xs text-gray-400">Set price first</span>;
  }

  let calculatedPrice = basePrice;

  switch (strategy) {
    case 'fixedPrice':
      calculatedPrice = value;
      break;
    case 'percentOff':
      calculatedPrice = basePrice * (1 - value / 100);
      break;
    case 'amountOff':
      calculatedPrice = Math.max(0, basePrice - value);
      break;
  }

  // Final check for NaN after calculation
  if (isNaN(calculatedPrice)) {
    return <span className="text-xs text-gray-400">Invalid</span>;
  }

  return (
    <div className="text-xs text-green-600 font-medium pt-2">
      ${calculatedPrice.toFixed(2)}
    </div>
  );
}
