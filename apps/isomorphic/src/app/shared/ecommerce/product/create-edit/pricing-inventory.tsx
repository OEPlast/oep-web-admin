import { useFormContext, Controller } from 'react-hook-form';
import { Input, Button, Select } from 'rizzui';
import { PiTrash } from 'react-icons/pi';
import FormGroup from '@/app/shared/form-group';
import cn from '@core/utils/class-names';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';

interface PricingInventoryProps {
  className?: string;
}

export default function PricingInventory({ className }: PricingInventoryProps) {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      <FormGroup
        title="Pricing"
        description="Add your product pricing here"
        className={cn(className)}
      >
        <Input
          type="number"
          label="Base Price"
          placeholder="0.00"
          step="0.01"
          min="0"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message as string}
        />
      </FormGroup>

      <FormGroup
        title="Inventory"
        description="Manage your product stock levels"
        className={cn(className)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            type="number"
            label="Stock Quantity"
            placeholder="0"
            min="0"
            {...register('stock', { valueAsNumber: true })}
            error={errors.stock?.message as string}
          />
          <Input
            type="number"
            label="Low Stock Threshold"
            placeholder="5"
            min="0"
            {...register('lowStockThreshold', { valueAsNumber: true })}
            error={errors.lowStockThreshold?.message as string}
          />
        </div>
      </FormGroup>

      <VerticalFormBlockWrapper
        title="Pricing Tiers (Bulk Pricing)"
        description="Set discounted pricing based on quantity purchased"
        className={cn(className, 'max-w-[1200px]')}
      >
        <div className="col-span-full space-y-4">
          {(watch('pricingTiers') || []).map((tier: any, index: number) => (
            <div key={index} className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 md:grid-cols-5">
              <Input
                type="number"
                label="Min Quantity"
                placeholder="1"
                min="1"
                {...register(`pricingTiers.${index}.minQty`, { valueAsNumber: true })}
                error={(errors.pricingTiers as any)?.[index]?.minQty?.message}
              />
              <Input
                type="number"
                label="Max Quantity (Optional)"
                placeholder="10"
                min="1"
                {...register(`pricingTiers.${index}.maxQty`, { valueAsNumber: true })}
                error={(errors.pricingTiers as any)?.[index]?.maxQty?.message}
              />
              <Controller
                name={`pricingTiers.${index}.strategy`}
                control={control}
                render={({ field }) => (
                  <Select
                    label="Strategy"
                    options={[
                      { value: 'fixedPrice', label: 'Fixed Price' },
                      { value: 'percentOff', label: 'Percent Off' },
                      { value: 'amountOff', label: 'Amount Off' },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    error={(errors.pricingTiers as any)?.[index]?.strategy?.message}
                  />
                )}
              />
              <Input
                type="number"
                label="Value"
                placeholder="0"
                step="0.01"
                min="0"
                {...register(`pricingTiers.${index}.value`, { valueAsNumber: true })}
                error={(errors.pricingTiers as any)?.[index]?.value?.message}
              />
              <Button
                type="button"
                variant="outline"
                color="danger"
                className="mt-6 hover:bg-red-500 hover:text-white max-w-[60px]"
                onClick={() => {
                  const tiers = getValues('pricingTiers') || [];
                  setValue('pricingTiers', tiers.filter((_: any, i: number) => i !== index));
                }}
              >
                <PiTrash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const tiers = getValues('pricingTiers') || [];
              setValue('pricingTiers', [
                ...tiers,
                { minQty: 1, strategy: 'fixedPrice' as const, value: 0 },
              ]);
            }}
          >
            + Add Pricing Tier
          </Button>
        </div>
      </VerticalFormBlockWrapper>
    </>
  );
}
