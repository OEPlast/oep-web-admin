'use client';
import { useEffect } from 'react'; // Added useEffect
import {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  Controller,
} from 'react-hook-form';
import { Input, Button, Select, Text } from 'rizzui';
import { CreateSalesInput } from '@/validators/create-sale.schema'; // Assuming VariantType is exported or define it here
import { BiSolidError, BiTrash } from 'react-icons/bi';

type VariantType = CreateSalesInput['variants'][number];

interface ProductForVariantForm {
  _id: string;
  name: string;
  image: string;
  stock: number;
  attributes: {
    name: string;
    children: {
      name: string;
      price: number;
      discount: number;
      stock: number;
      image: string;
    }[];
  }[];
}

interface SaleVariantsFormProps {
  control: Control<CreateSalesInput>;
  errors: FieldErrors<CreateSalesInput>;
  watch: UseFormWatch<CreateSalesInput>;
  register: UseFormRegister<CreateSalesInput>;
  setValue: UseFormSetValue<CreateSalesInput>;
  selectedProduct: ProductForVariantForm | null;
}

const defaultNewVariant: VariantType = {
  attributeName: '',
  attributeValue: '',
  discount: 10,
  maxBuys: 0,
};

const getAttributeNameOptions = (
  selectedProduct: ProductForVariantForm | null,
  index: number,
  variantsLength: number
) => {
  if (!selectedProduct) return [];
  const options = selectedProduct.attributes.map((attr) => ({
    value: attr.name,
    label: attr.name,
  }));
  if (index === 0 && variantsLength === 1) {
    return [{ value: 'All', label: 'All' }, ...options];
  }
  return options;
};

const getAttributeValueOptions = (
  selectedProduct: ProductForVariantForm | null,
  index: number,
  variantsLength: number,
  watchedAttributeName: string | null | undefined
) => {
  if (!selectedProduct || !watchedAttributeName) return [];

  const attribute = selectedProduct.attributes.find(
    (attr) => attr.name === watchedAttributeName
  );

  const childrenOptions = attribute
    ? attribute.children.map((child) => ({
        value: child.name,
        label: child.name,
      }))
    : [];

  if (index === 0 && variantsLength === 1 && watchedAttributeName === 'All') {
    return [{ value: 'All', label: 'All' }, ...childrenOptions];
  }
  if (watchedAttributeName === 'All') {
    return []; // No specific values if 'All' attributes selected, unless it's the first and only variant
  }
  return childrenOptions;
};

// Helper function to determine if the Attribute Value select should be disabled
const isAttributeValueDisabled = (
  watchedAttributeName: string | null | undefined,
  index: number,
  variantsLength: number
): boolean => {
  // If it's the first and only variant and attributeName is 'All', attributeValue is also 'All' and should be disabled.
  if (index === 0 && variantsLength === 1 && watchedAttributeName === 'All') {
    return true;
  }
  // Disabled if no attribute name is selected OR if attribute name is 'All' (for other cases)
  return !watchedAttributeName || watchedAttributeName === 'All';
};

export default function SaleVariantsForm({
  control,
  errors,
  watch,
  register,
  setValue,
  selectedProduct,
}: SaleVariantsFormProps) {
  const variants = watch('variants');
  const saleType = watch('type');

  useEffect(() => {
    if (saleType === 'Limited' && variants && Array.isArray(variants)) {
      const sumOfMaxBuys = variants.reduce(
        (acc, variant) => acc + (Number(variant.maxBuys) || 0),
        0
      );
      setValue('limit', sumOfMaxBuys, { shouldValidate: true });
    }
  }, [variants, saleType, setValue]);

  const handleAddVariant = () => {
    setValue('variants', [
      ...(variants || []),
      {
        ...defaultNewVariant,
        boughtCount: 0, // Ensure all fields from schema are present
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants && variants.length > 1) {
      const updatedVariants = [...variants];
      updatedVariants.splice(index, 1);
      setValue('variants', updatedVariants);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="relative rounded p-3 text-center text-gray-500 outline outline-yellow-100">
        <div className="absolute right-2 top-2">
          <BiSolidError className="h-6 w-6 text-yellow-500" />
        </div>
        Select a product first to configure variants.
      </div>
    );
  }

  return (
    <div>
      <h4 className="mb-4 text-lg font-medium">Variants</h4>
      {variants &&
        variants.map((variant, index) => (
          <div
            key={index} // Consider using a more stable key if variants can be reordered significantly
            className="mb-6 space-y-3 rounded-md border p-4 shadow-sm"
          >
            <Controller
              name={`variants.${index}.attributeName`}
              control={control}
              render={({ field }) => (
                <Select
                  label="Attribute Name"
                  options={getAttributeNameOptions(
                    selectedProduct,
                    index,
                    variants.length
                  )}
                  value={field.value}
                  onChange={(valueFromSelect) => {
                    const newValue =
                      valueFromSelect === undefined ? null : valueFromSelect;
                    field.onChange(newValue);

                    // When attributeName changes:
                    // 1. If it's the first/only variant and attributeName is 'All', set attributeValue to 'All'.
                    // 2. Otherwise, reset attributeValue to null.
                    if (
                      index === 0 &&
                      variants.length === 1 &&
                      newValue === 'All'
                    ) {
                      setValue(`variants.${index}.attributeValue`, 'All');
                    } else {
                      setValue(`variants.${index}.attributeValue`, null);
                    }
                  }}
                  error={errors.variants?.[index]?.attributeName?.message}
                  getOptionValue={(option) => option.value}
                />
              )}
            />
            <Controller
              name={`variants.${index}.attributeValue`}
              control={control}
              render={({ field }) => (
                <Select
                  label="Attribute Value"
                  options={getAttributeValueOptions(
                    selectedProduct,
                    index,
                    variants.length,
                    watch(`variants.${index}.attributeName`)
                  )}
                  value={field.value}
                  onChange={(valueFromSelect) => {
                    // valueFromSelect is string | null
                    const newValue =
                      valueFromSelect === undefined ? null : valueFromSelect;
                    field.onChange(newValue);
                  }}
                  error={errors.variants?.[index]?.attributeValue?.message}
                  disabled={isAttributeValueDisabled(
                    watch(`variants.${index}.attributeName`),
                    index,
                    variants.length
                  )}
                  getOptionValue={(option) => option.value}
                />
              )}
            />
            <Input
              label="Discount (%)"
              type="number"
              {...register(`variants.${index}.discount`, {
                required: 'Discount is required.',
                valueAsNumber: true,
                min: { value: 0, message: 'Discount cannot be negative.' },
                max: { value: 100, message: 'Discount cannot exceed 100.' },
              })}
              error={errors.variants?.[index]?.discount?.message}
              placeholder="e.g., 10 for 10%"
            />
            {saleType === 'Limited' && (
              <Input
                label="Buyable Maximum (per variant)"
                type="number"
                {...register(`variants.${index}.maxBuys`, {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Max Buys cannot be negative.' },
                  // Schema handles requirement for 'Limited' type
                })}
                error={errors.variants?.[index]?.maxBuys?.message}
                helperText="Max times this specific variant can be bought by a single user."
              />
            )}
            <div className="pt-1 text-sm text-gray-600">
              {(() => {
                const attributeName = variant.attributeName;
                const attributeValue = variant.attributeValue;
                // Show product stock when no specific attribute selected or 'All'
                if (!attributeName || attributeName === 'All') {
                  return <span>Product Stock: {selectedProduct.stock}</span>;
                }
                // Show sum of attribute stocks when attributeValue is 'All'
                if (attributeValue === 'All') {
                  const attr = selectedProduct.attributes.find(
                    (attr) => attr.name === attributeName
                  );
                  const sumStock =
                    attr?.children.reduce(
                      (sum, child) => sum + child.stock,
                      0
                    ) || 0;

                  return <span>Attribute Stock: {sumStock}</span>;
                }
                // Show specific variant stock
                const attr = selectedProduct.attributes.find(
                  (attr) => attr.name === attributeName
                );
                const mainChild = attr?.children.find(
                  (child) => child.name === attributeValue
                );

                return <span>Variant Stock: {mainChild?.stock || 0}</span>;
              })()}
            </div>
            {variants.length > 1 && (
              <Button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="mt-2 w-full bg-red-500 text-white hover:bg-red-600 hover:text-white sm:w-auto"
                variant="flat"
              >
                <BiTrash className="mr-1.5 h-4 w-4" /> Remove Variant
              </Button>
            )}
          </div>
        ))}
      <Button
        type="button"
        onClick={handleAddVariant}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
      >
        Add Variant
      </Button>
      {errors.variants?.message && (
        <Text className="mt-2 text-sm text-red-500">
          {errors.variants.message}
        </Text>
      )}
      {errors.variants?.root?.message && (
        <Text className="mt-2 text-sm text-red-500">
          {errors.variants.root.message}
        </Text>
      )}
    </div>
  );
}
