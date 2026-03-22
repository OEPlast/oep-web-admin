'use client';

import { useFormContext } from 'react-hook-form';
import { Input, Switch } from 'rizzui';
import cn from '@core/utils/class-names';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';

export default function ShippingInfo({ className }: { className?: string }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const isVolumetric = watch('isVolumetric');

  return (
    <VerticalFormBlockWrapper
      title="Shipping"
      description="Configure shipping dimensions, weight, and additional costs for this product"
      className={cn(className)}
    >
      <div className="col-span-full space-y-6">
        {/* GIG Shipping Dimensions */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-700">
            Package Dimensions & Weight
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              type="number"
              label="Weight (kg)"
              placeholder="1.0"
              step="0.1"
              min="0"
              {...register('weight', { valueAsNumber: true })}
              error={errors.weight?.message as string}
              suffix="kg"
            />
            <Input
              type="number"
              label="Length (cm)"
              placeholder="10"
              step="0.1"
              min="0"
              {...register('length', { valueAsNumber: true })}
              error={errors.length?.message as string}
              suffix="cm"
            />
            <Input
              type="number"
              label="Width (cm)"
              placeholder="10"
              step="0.1"
              min="0"
              {...register('width', { valueAsNumber: true })}
              error={errors.width?.message as string}
              suffix="cm"
            />
            <Input
              type="number"
              label="Height (cm)"
              placeholder="10"
              step="0.1"
              min="0"
              {...register('height', { valueAsNumber: true })}
              error={errors.height?.message as string}
              suffix="cm"
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Switch
              checked={isVolumetric ?? false}
              onChange={(e) => setValue('isVolumetric', e.target.checked)}
            />
            <label className="text-sm text-gray-600">
              Volumetric shipping — use dimensions for shipping cost calculation
              instead of weight alone
            </label>
          </div>
        </div>

        {/* Additional Shipping Costs */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-700">
            Additional Shipping Costs
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              type="number"
              label="Added Cost (&#8358;)"
              placeholder="0.00"
              step="0.01"
              min="0"
              {...register('shipping.addedCost', { valueAsNumber: true })}
              error={(errors.shipping as any)?.addedCost?.message}
              prefix="₦"
            />
            <Input
              type="number"
              label="Increase Cost By (%)"
              placeholder="0"
              step="0.01"
              min="0"
              max="100"
              {...register('shipping.increaseCostBy', { valueAsNumber: true })}
              error={(errors.shipping as any)?.increaseCostBy?.message}
              suffix="%"
            />
            <Input
              type="number"
              label="Added Days"
              placeholder="0"
              min="0"
              {...register('shipping.addedDays', { valueAsNumber: true })}
              error={(errors.shipping as any)?.addedDays?.message}
              suffix="days"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            These values will be added to the base shipping cost and delivery
            time calculated from the shipping zone.
          </p>
        </div>
      </div>
    </VerticalFormBlockWrapper>
  );
}
