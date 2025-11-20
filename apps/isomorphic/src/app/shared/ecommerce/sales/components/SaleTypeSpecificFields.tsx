'use client';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import { Input } from 'rizzui';
import { DatePicker } from '@core/ui/datepicker';
import { CreateSalesInput } from '@/validators/create-sale.schema';

interface SaleTypeSpecificFieldsProps {
  control: Control<CreateSalesInput>;
  errors: FieldErrors<CreateSalesInput>;
  watch: UseFormWatch<CreateSalesInput>;
  register: UseFormRegister<CreateSalesInput>;
}

export default function SaleTypeSpecificFields({
  control,
  errors,
  watch,
  register,
}: SaleTypeSpecificFieldsProps) {
  const saleType = watch('type');

  return (
    <>
      {saleType === 'Flash' && (
        <>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <div className="flex-1">
                <label className="mb-1 block font-medium">Start Date</label>
                <DatePicker
                  selected={new Date(field.value)}
                  onChange={field.onChange}
                  dateFormat="yyyy-MM-dd"
                  inputProps={{ placeholder: 'Start Date' }}
                  className="w-full"
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <div className="flex-1">
                <label className="mb-1 block font-medium">End Date</label>
                <DatePicker
                  selected={new Date(field.value)}
                  onChange={field.onChange}
                  dateFormat="yyyy-MM-dd"
                  inputProps={{ placeholder: 'End Date' }}
                  className="w-full"
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            )}
          />
        </>
      )}

    </>
  );
}
