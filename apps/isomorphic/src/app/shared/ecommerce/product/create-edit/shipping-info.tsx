'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from 'rizzui';
import cn from '@core/utils/class-names';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';

export default function ShippingInfo({ className }: { className?: string }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <VerticalFormBlockWrapper
      title="Shipping"
      description="Configure additional shipping costs and delivery times for this product"
      className={cn(className)}
    >
      <div className="col-span-full space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            type="number"
            label="Added Cost ($)"
            placeholder="0.00"
            step="0.01"
            min="0"
            {...register('shipping.addedCost', { valueAsNumber: true })}
            error={(errors.shipping as any)?.addedCost?.message}
            prefix="$"
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
        <p className="text-sm text-gray-500">
          These values will be added to the base shipping cost and delivery time calculated from the shipping zone.
        </p>
      </div>
    </VerticalFormBlockWrapper>
  );
}
