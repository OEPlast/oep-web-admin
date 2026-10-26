'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { ActionIcon, Button, Input } from 'rizzui';
import { PiPlusBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import TrashIcon from '@core/components/icons/trash';
import { CreateProductInput } from '@/validators/product-schema';

const MAX_EXTRAS = 10;

/**
 * Optional add-ons that aren't products (e.g. "Tester ₦18,000", "Silver polish" for free). The
 * shopper ticks the ones they want on the product page and each one's price is added per unit.
 */
export default function ProductExtras({ className }: { className?: string }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateProductInput>();
  const { fields, append, remove } = useFieldArray({ control, name: 'extras' });

  return (
    <FormGroup
      title="Extras"
      description="Optional things the shopper can tick to add (e.g. a tester, free polish). They aren't products; 0 shows as Free."
      className={cn(className)}
    >
      {fields.length === 0 && (
        <p className="col-span-full text-sm text-gray-500">No extras. Shoppers just pick the options above.</p>
      )}

      {fields.map((field, index) => {
        const error = errors.extras?.[index];
        return (
          <div key={field.id} className="col-span-full grid grid-cols-1 items-start gap-3 md:grid-cols-[1fr_160px_2fr_auto]">
            <Input
              label="Name"
              placeholder="e.g. Tester"
              {...register(`extras.${index}.name`)}
              error={error?.name?.message}
            />
            <Input
              type="number"
              label="Price (₦)"
              placeholder="0 = Free"
              min={0}
              {...register(`extras.${index}.price`, { valueAsNumber: true })}
              error={error?.price?.message}
            />
            <Input
              label="Note (optional)"
              placeholder="e.g. Try the size before the real one ships"
              {...register(`extras.${index}.description`)}
              error={error?.description?.message}
            />
            <ActionIcon onClick={() => remove(index)} variant="flat" color="danger" className="mt-7 shrink-0" aria-label="Remove extra">
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </div>
        );
      })}

      {typeof errors.extras?.message === 'string' && (
        <p className="col-span-full text-sm text-red">{errors.extras.message}</p>
      )}

      {fields.length < MAX_EXTRAS && (
        <div className="col-span-full">
          <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0, description: '' })}>
            <PiPlusBold className="me-2 h-4 w-4" /> Add extra
          </Button>
        </div>
      )}
    </FormGroup>
  );
}
