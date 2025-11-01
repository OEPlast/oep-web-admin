'use client';

import { Button, Input, Checkbox } from 'rizzui';
import { PiTrash, PiPlus, PiPackage } from 'react-icons/pi';
import { UseFormReturn } from 'react-hook-form';
import { CreateProductInput } from '@/validators/product-schema';
import cn from '@core/utils/class-names';

interface PackSizesManagerProps {
  form: UseFormReturn<CreateProductInput>;
}

export default function PackSizesManager({ form }: PackSizesManagerProps) {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const packSizes = watch('packSizes') || [];
  const hasPackSizes = packSizes.length > 0;

  const addPackSize = () => {
    const currentPacks = getValues('packSizes') || [];
    setValue('packSizes', [
      ...currentPacks,
      {
        label: '',
        quantity: 1,
        enableAttributes: false,
      },
    ]);
  };

  const removePackSize = (index: number) => {
    const currentPacks = getValues('packSizes') || [];
    setValue(
      'packSizes',
      currentPacks.filter((_, i) => i !== index)
    );
  };

  const clearAllPackSizes = () => {
    setValue('packSizes', []);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PiPackage className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {hasPackSizes
              ? `${packSizes.length} pack size${packSizes.length !== 1 ? 's' : ''} configured`
              : 'No pack sizes configured (product sold as single unit)'}
          </span>
        </div>
        {hasPackSizes && (
          <Button
            type="button"
            variant="outline"
            color="danger"
            size="sm"
            onClick={clearAllPackSizes}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Info Banner */}
      {!hasPackSizes && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-700">
            <strong>What are pack sizes?</strong> Configure how this product can be purchased (e.g., Single, Bag of 10, Carton of 50).
            Each pack can have custom pricing, stock tracking, and attribute selection control.
          </p>
        </div>
      )}

      {/* Pack Size List */}
      {hasPackSizes && (
        <div className="space-y-4">
          {packSizes.map((pack, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-gray-300"
            >
              {/* Pack Header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Pack #{index + 1} {pack.label ? `- ${pack.label}` : ''}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  color="danger"
                  size="sm"
                  onClick={() => removePackSize(index)}
                >
                  <PiTrash className="h-4 w-4" />
                </Button>
              </div>

              {/* Pack Fields */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Label */}
                <Input
                  label={
                    <span>
                      Pack Label <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="e.g., Single, Bag of 10, Carton"
                  {...register(`packSizes.${index}.label`)}
                  error={errors.packSizes?.[index]?.label?.message as string}
                />

                {/* Quantity */}
                <Input
                  type="number"
                  label={
                    <span>
                      Quantity <span className="text-red-500">*</span>
                    </span>
                  }
                  placeholder="1"
                  min="1"
                  {...register(`packSizes.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  error={errors.packSizes?.[index]?.quantity?.message as string}
                />

                {/* Custom Price (Optional) */}
                <Input
                  type="number"
                  label="Custom Price (Optional)"
                  placeholder="Leave empty to auto-calculate"
                  step="0.01"
                  min="0"
                  {...register(`packSizes.${index}.price`, {
                    valueAsNumber: true,
                  })}
                  error={errors.packSizes?.[index]?.price?.message as string}
                  helperText={
                    !pack.price
                      ? `Auto-calculated: Base price × ${pack.quantity || 1}`
                      : undefined
                  }
                />

                {/* Custom Stock (Optional) */}
                <Input
                  type="number"
                  label="Custom Stock (Optional)"
                  placeholder="Leave empty to use base stock"
                  min="0"
                  {...register(`packSizes.${index}.stock`, {
                    valueAsNumber: true,
                  })}
                  error={errors.packSizes?.[index]?.stock?.message as string}
                  helperText={
                    !pack.stock ? 'Will use base product stock' : undefined
                  }
                />
              </div>

              {/* Enable Attributes Checkbox */}
              <div className="mt-4 rounded-md border border-gray-200 bg-white p-3">
                <label className="flex items-start gap-3">
                  <Checkbox
                    {...register(`packSizes.${index}.enableAttributes`)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">
                      Enable attribute selection for this pack
                    </span>
                    <p className="mt-1 text-xs text-gray-500">
                      {pack.enableAttributes ? (
                        <>
                          ✓ Customers can select color, material, or other attributes when buying this pack.
                        </>
                      ) : (
                        <>
                          ✗ Pre-packaged - no attribute selection available. Useful for wholesale or bulk packs.
                        </>
                      )}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Pack Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addPackSize}
        className="w-full"
      >
        <PiPlus className="h-4 w-4" />
        Add Pack Size
      </Button>

      {/* Pricing Logic Explanation */}
      {hasPackSizes && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Pricing & Stock Logic
          </h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• <strong>Effective Price:</strong> pack.price ?? (product.price × pack.quantity)</li>
            <li>• <strong>Effective Stock:</strong> pack.stock ?? product.stock</li>
            <li>• <strong>Attributes:</strong> Only shown if enableAttributes is true</li>
            <li>• <strong>No Packs:</strong> Product sold as single unit with base price/stock</li>
          </ul>
        </div>
      )}
    </div>
  );
}
