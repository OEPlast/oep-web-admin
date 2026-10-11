'use client';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Input, Button, ActionIcon, Select, Popover } from 'rizzui';
import { HexColorPicker } from 'react-colorful';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import TrashIcon from '@core/components/icons/trash';
import { PiCheckBold, PiPlusBold } from 'react-icons/pi';
import { getCdnUrl } from '@core/utils/cdn-url';
import { isWholesaleEnabled } from '@/config/features';
import { useEffect, useState } from 'react';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import { formatToNaira } from '@/libs/currencyFormatter';

// Hardcoded attribute templates
const ATTRIBUTE_TEMPLATES = {
  sizes: {
    name: 'Size',
    children: [
      { name: 'XS', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
      { name: 'S', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
      { name: 'M', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
      { name: 'L', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
      { name: 'XL', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
      { name: 'XXL', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
    ],
  },
  colors: {
    name: 'Color',
    children: [
      {
        name: 'Black',
        colorCode: '#1A1A1A',
        price: undefined,
        stock: 0,
        image: '',
        images: [],
        pricingTiers: [],
      },
      {
        name: 'White',
        colorCode: '#FFFFFF',
        price: undefined,
        stock: 0,
        image: '',
        images: [],
        pricingTiers: [],
      },
      { name: 'Red', colorCode: '#C8102E', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
      { name: 'Blue', colorCode: '#1F4FD1', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
      {
        name: 'Green',
        colorCode: '#2E7D32',
        price: undefined,
        stock: 0,
        image: '',
        images: [],
        pricingTiers: [],
      },
      { name: 'Gray', colorCode: '#9E9E9E', price: undefined, stock: 0, image: '', images: [], pricingTiers: [] },
    ],
  },
};

export default function ProductVariants({ className }: { className?: string }) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext();

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

  const addTemplateVariant = (template: 'sizes' | 'colors') => {
    append(ATTRIBUTE_TEMPLATES[template]);
  };

  // Check which templates are already added
  const existingAttributes = watch('attributes') || [];
  const existingNames = existingAttributes.map((attr: any) =>
    attr.name?.toLowerCase()
  );
  const hasSizes = existingNames.includes('size');
  const hasColors = existingNames.includes('color');

  return (
    <VerticalFormBlockWrapper
      title="Product Variants (Attributes)"
      description="Define product variations with their own pricing, stock, and images"
      className={cn(className, 'w-full max-w-none')}
    >
      {fields.length === 0 && (
        <div className="col-span-full rounded-lg border border-dashed py-8 text-center text-gray-500">
          <p>No variants added yet</p>
          <p className="mt-2 text-sm">
            Use quick templates or create custom product variations
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {!hasSizes && (
              <Button
                type="button"
                onClick={() => addTemplateVariant('sizes')}
                variant="outline"
                size="sm"
              >
                Add Sizes
              </Button>
            )}
            {!hasColors && (
              <Button
                type="button"
                onClick={() => addTemplateVariant('colors')}
                variant="outline"
                size="sm"
              >
                Add Colors
              </Button>
            )}
            <Button
              type="button"
              onClick={addVariant}
              variant="outline"
              size="sm"
            >
              Add Custom Variant
            </Button>
          </div>
        </div>
      )}

      {fields.map((item, index) => (
        <div
          key={item.id}
          className="col-span-full space-y-4 rounded-lg border border-gray-200 p-6"
        >
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Variant Name"
              placeholder="e.g. Metal, Color, Chain Length, Diamond Tester"
              {...register(`attributes.${index}.name`)}
              error={(errors.attributes as any)?.[index]?.name?.message}
              helperText="Shown on the product page as written. Values with a colour (the swatch next to each value) appear as colour squares; the rest appear as buttons."
            />
          </div>

          <VariantChildren attributeIndex={index} />
        </div>
      ))}

      {fields.length > 0 && (
        <div className="col-span-full flex gap-2">
          {!hasSizes && (
            <Button
              type="button"
              onClick={() => addTemplateVariant('sizes')}
              variant="outline"
              size="sm"
            >
              Add Sizes
            </Button>
          )}
          {!hasColors && (
            <Button
              type="button"
              onClick={() => addTemplateVariant('colors')}
              variant="outline"
              size="sm"
            >
              Add Colors
            </Button>
          )}
          <Button
            type="button"
            onClick={addVariant}
            variant="outline"
            className="ml-auto"
          >
            <PiPlusBold className="me-2 h-4 w-4" /> Custom
          </Button>
        </div>
      )}
    </VerticalFormBlockWrapper>
  );
}

function VariantChildren({ attributeIndex }: { attributeIndex: number }) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const [showChildren, setShowChildren] = useState(true);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `attributes.${attributeIndex}.children`,
  });

  const productPrice = watch('price') || 0;
  const wholesale = isWholesaleEnabled();

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="mb-4 flex items-center justify-between">
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
          <div className="grid grid-cols-10 gap-3 px-2 text-xs font-medium text-gray-600">
            <div className="col-span-3">Value</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-1">Images</div>
            <div className="col-span-1">{wholesale ? 'Tiers' : ''}</div>
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
            onClick={() =>
              append({
                name: '',
                price: undefined,
                stock: undefined,
                image: '',
                images: [],
                pricingTiers: [],
              })
            }
            className="w-full"
          >
            <PiPlusBold className="me-2 h-3 w-3" /> Add Value
          </Button>

          {fields.length === 0 && (
            <p className="rounded border border-dashed py-4 text-center text-sm text-gray-500">
              {`No sub-variants yet. Add values like "Red", "Blue" for Color or
              "Small", "Medium" for Size.`}
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
  onRemove,
}: {
  attributeIndex: number;
  childIndex: number;
  productPrice: number;
  onRemove: () => void;
}) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const [showPricingTiers, setShowPricingTiers] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const wholesale = isWholesaleEnabled();
  const imageCount = (
    watch(`attributes.${attributeIndex}.children.${childIndex}.images`) || []
  ).length;

  const childPrice = watch(
    `attributes.${attributeIndex}.children.${childIndex}.price`
  );
  const pricingTiers =
    watch(`attributes.${attributeIndex}.children.${childIndex}.pricingTiers`) ||
    [];
  const tierCount = pricingTiers.length;
  const effectivePrice =
    childPrice !== undefined && childPrice !== null && childPrice !== ''
      ? childPrice
      : productPrice;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-10 items-start gap-3">
        <div className="col-span-3 flex items-start gap-2">
          <ColorCodeField attributeIndex={attributeIndex} childIndex={childIndex} />
          <Input
            size="sm"
            className="min-w-0 flex-1"
            placeholder="e.g. Small, Red, Yes"
            {...register(
              `attributes.${attributeIndex}.children.${childIndex}.name`
            )}
            error={
              (errors.attributes as any)?.[attributeIndex]?.children?.[
                childIndex
              ]?.name?.message
            }
          />
        </div>

        <div className="col-span-2">
          <Input
            size="sm"
            type="number"
            placeholder="0"
            min="0"
            {...register(
              `attributes.${attributeIndex}.children.${childIndex}.stock`,
              { valueAsNumber: true }
            )}
            error={
              (errors.attributes as any)?.[attributeIndex]?.children?.[
                childIndex
              ]?.stock?.message
            }
          />
        </div>

        <div className="col-span-2">
          <Input
            size="sm"
            type="number"
            step="0.01"
            placeholder={`${productPrice}`}
            prefix="&#8358;"
            {...register(
              `attributes.${attributeIndex}.children.${childIndex}.price`,
              { valueAsNumber: true }
            )}
            error={
              (errors.attributes as any)?.[attributeIndex]?.children?.[
                childIndex
              ]?.price?.message
            }
            helperText={
              !childPrice ? `Uses parent: ${formatToNaira(productPrice)}` : ''
            }
          />
        </div>

        <div className="col-span-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowImages(!showImages)}
            className="w-full px-2 text-xs"
          >
            {showImages ? 'Hide' : 'Images'}
            {imageCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-500 px-1 text-xs text-white">
                {imageCount}
              </span>
            )}
          </Button>
        </div>

        <div className="col-span-1">
          {wholesale && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPricingTiers(!showPricingTiers)}
              className="w-full px-2 text-xs"
            >
              {showPricingTiers ? 'Hide' : 'Tiers'}
              {tierCount > 0 && (
                <span className="ml-1 rounded-full bg-blue-500 px-1 text-xs text-white">
                  {tierCount}
                </span>
              )}
            </Button>
          )}
        </div>

        <div className="col-span-1 flex justify-end">
          <ActionIcon onClick={onRemove} variant="flat" size="sm">
            <TrashIcon className="h-3 w-3" />
          </ActionIcon>
        </div>
      </div>

      {showImages && (
        <div className="ml-4 border-l-2 border-gray-200 pl-4">
          <VariantImagesPicker
            attributeIndex={attributeIndex}
            childIndex={childIndex}
          />
        </div>
      )}

      {wholesale && showPricingTiers && (
        <div className="ml-4 border-l-2 border-gray-200 pl-4">
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

const HEX = /^#([0-9a-f]{3}){1,2}$/i;

/**
 * The value's swatch colour: a square that opens a colour picker (or takes a hex code). Values
 * with a colour show as colour squares on the storefront; "No colour" makes it a text button.
 */
function ColorCodeField({ attributeIndex, childIndex }: { attributeIndex: number; childIndex: number }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={`attributes.${attributeIndex}.children.${childIndex}.colorCode`}
      control={control}
      render={({ field }) => <ColorCodePicker value={field.value} onChange={field.onChange} />}
    />
  );
}

function ColorCodePicker({ value, onChange }: { value?: string; onChange: (value: string | undefined) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(value ?? '');
  useEffect(() => setText(value ?? ''), [value]);
  const hasColor = !!value && HEX.test(value);

  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} placement="bottom-start" shadow="sm">
      <Popover.Trigger>
        <button
          type="button"
          title={hasColor ? `Colour ${value}` : 'Add a colour (shows a swatch on the storefront)'}
          aria-label={hasColor ? `Colour ${value}, change` : 'Add a colour'}
          className={cn(
            'mt-1 h-7 w-7 shrink-0 rounded border border-gray-300 hover:border-gray-900',
            !hasColor && 'bg-[repeating-linear-gradient(45deg,#f3f4f6_0_4px,#fff_4px_8px)]'
          )}
          style={hasColor ? { backgroundColor: value } : undefined}
        />
      </Popover.Trigger>
      <Popover.Content className="z-[9999] w-[232px] space-y-3 p-3">
        <HexColorPicker color={hasColor ? value : '#D4AF37'} onChange={(hex) => onChange(hex.toUpperCase())} />
        <Input
          size="sm"
          value={text}
          placeholder="#D4AF37"
          onChange={(e) => {
            setText(e.target.value);
            if (HEX.test(e.target.value.trim())) onChange(e.target.value.trim().toUpperCase());
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => {
              onChange(undefined);
              setIsOpen(false);
            }}
          >
            No colour
          </Button>
          <Button type="button" size="sm" className="flex-1" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
}

/**
 * Picks which of the product's uploaded images belong to this value (e.g. the Rose Gold
 * photos), so the storefront can switch the gallery when it is selected. Stores the images'
 * bare url paths; nothing picked means the product gallery is used.
 */
function VariantImagesPicker({
  attributeIndex,
  childIndex,
}: {
  attributeIndex: number;
  childIndex: number;
}) {
  const { control, watch } = useFormContext();
  const media: Array<{ url: string; mediaType?: 'image' | 'video' }> =
    watch('description_images') || [];
  const images = media.filter((m) => (m.mediaType ?? 'image') === 'image');

  return (
    <Controller
      name={`attributes.${attributeIndex}.children.${childIndex}.images`}
      control={control}
      render={({ field }) => {
        const selected: string[] = field.value || [];
        const toggle = (url: string) =>
          field.onChange(
            selected.includes(url)
              ? selected.filter((u) => u !== url)
              : [...selected, url]
          );
        return (
          <div className="space-y-2 py-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-medium text-gray-700">
                Images for this value
              </h5>
              {selected.length > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="text"
                  className="h-auto p-0 text-xs"
                  onClick={() => field.onChange([])}
                >
                  Clear
                </Button>
              )}
            </div>
            {images.length === 0 ? (
              <p className="py-2 text-xs text-gray-500">
                Upload product images under Images &amp; Gallery first, then
                pick the ones that show this value.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {images.map((img) => {
                  const isSelected = selected.includes(img.url);
                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => toggle(img.url)}
                      aria-pressed={isSelected}
                      className={cn(
                        'relative h-16 w-16 overflow-hidden rounded border-2 transition',
                        isSelected
                          ? 'border-primary'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      )}
                    >
                      <img
                        src={getCdnUrl(img.url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute right-0.5 top-0.5 rounded-full bg-primary p-0.5 text-white">
                          <PiCheckBold className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-500">
              {selected.length
                ? `${selected.length} selected, shown in the order picked.`
                : 'None picked: the full product gallery is shown.'}
            </p>
          </div>
        );
      }}
    />
  );
}

function PricingTiers({
  attributeIndex,
  childIndex,
  basePrice,
}: {
  attributeIndex: number;
  childIndex: number;
  basePrice: number;
}) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `attributes.${attributeIndex}.children.${childIndex}.pricingTiers`,
  });

  return (
    <div className="space-y-3 py-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-medium text-gray-700">
          Wholesale Pricing Tiers
        </h5>
        <span className="text-xs text-gray-500">
          Base price:{' '}
          {isNaN(basePrice) || !basePrice
            ? 'Not set'
            : `${formatToNaira(basePrice)}`}
        </span>
      </div>

      {fields.length === 0 && (
        <p className="py-2 text-xs text-gray-500">
          No pricing tiers. Add tiers for wholesale/bulk pricing.
        </p>
      )}

      {fields.map((tier, tierIndex) => (
        <div key={tier.id} className="grid grid-cols-12 items-start gap-2">
          <div className="col-span-2">
            <Input
              size="sm"
              type="number"
              placeholder="Min"
              min="1"
              {...register(
                `attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.minQty`,
                { valueAsNumber: true }
              )}
              error={
                (errors.attributes as any)?.[attributeIndex]?.children?.[
                  childIndex
                ]?.pricingTiers?.[tierIndex]?.minQty?.message
              }
            />
          </div>

          <div className="col-span-2">
            <Controller
              name={`attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.maxQty`}
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  size="sm"
                  type="number"
                  placeholder="Max"
                  min="1"
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Convert to number only if not empty, otherwise set to undefined
                    field.onChange(value === '' ? undefined : Number(value));
                  }}
                  error={fieldState.error?.message}
                />
              )}
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
                  error={
                    (errors.attributes as any)?.[attributeIndex]?.children?.[
                      childIndex
                    ]?.pricingTiers?.[tierIndex]?.strategy?.message
                  }
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
              {...register(
                `attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.value`,
                { valueAsNumber: true }
              )}
              error={
                (errors.attributes as any)?.[attributeIndex]?.children?.[
                  childIndex
                ]?.pricingTiers?.[tierIndex]?.value?.message
              }
            />
          </div>

          <div className="col-span-2">
            <TierCalculatedPrice
              strategy={watch(
                `attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.strategy`
              )}
              value={watch(
                `attributes.${attributeIndex}.children.${childIndex}.pricingTiers.${tierIndex}.value`
              )}
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
        onClick={() =>
          append({
            minQty: 1,
            maxQty: undefined,
            strategy: 'fixedPrice',
            value: basePrice,
          })
        }
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
  basePrice,
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
    <div className="pt-2 text-xs font-medium text-green-600">
      {formatToNaira(calculatedPrice)}
    </div>
  );
}
