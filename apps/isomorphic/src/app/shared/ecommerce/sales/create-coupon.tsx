'use client';

import { useState } from 'react';
import { Button, Input, Select, Text, Title } from 'rizzui';
import { Form } from '@core/ui/form';
import { SubmitHandler, Controller } from 'react-hook-form';
import { CouponDataType } from '@/data/coupon-data';
import { DatePicker } from '@core/ui/datepicker';
import QuantityInput from '@/app/shared/explore-flight/listing-filters/quantity-input';

const couponTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'one-off', label: 'One-off' },
  { value: 'one-off-user', label: 'One-off per user' },
];

export default function CreateCoupon() {
  const [isLoading, setLoading] = useState(false);

  const onSubmit = (data: CouponDataType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Here you would send data to your API
      console.log('createCoupon data ->', data);
    }, 600);
  };

  const description =
    'Fill in the details below to create a new coupon. Set the code, discount, type, and validity period.';

  return (
    <Form<CouponDataType>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        defaultValues: {
          coupon: '',
          startDate: new Date(),
          endDate: new Date(),
          discount: 0,
          active: true,
          timesUsed: 0,
          couponType: 'normal',
          creator: '',
          deleted: false,
          createdAt: new Date(),
          _id: '',
        },
      }}
      className="isomorphic-form flex max-w-[700px] flex-col gap-6"
    >
      {({ register, control, setValue, watch, formState: { errors } }) => (
        <>
          <div className="col-span-2 mb-1 pe-4 @5xl:mb-0">
            <Text className="mt-1 text-sm text-gray-500">{description}</Text>
          </div>
          <div className="flex flex-col gap-6">
            <Input
              label="Coupon Code"
              placeholder="COUPON2025"
              {...register('coupon', { required: true })}
              error={errors.coupon?.message}
            />
            <Controller
              name="discount"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="mb-1 block font-medium">
                    Discount Amount %
                  </label>
                  <QuantityInput
                    max={99}
                    variantType={'outline'}
                    className="w-full"
                    name={field.name}
                    defaultValue={field.value}
                    onChange={field.onChange}
                    error={errors.discount?.message}
                  />
                </div>
              )}
            />
            <Controller
              name="couponType"
              control={control}
              render={({ field }) => (
                <Select
                  label="Coupon Type"
                  options={couponTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.couponType?.message as string}
                />
              )}
            />
            <div className="flex gap-4">
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <div className="flex-1">
                    <label className="mb-1 block font-medium">Start Date</label>
                    <DatePicker
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="yyyy-MM-dd"
                      inputProps={{ placeholder: 'Start Date' }}
                      className="w-full"
                    />
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
                      selected={field.value}
                      onChange={field.onChange}
                      dateFormat="yyyy-MM-dd"
                      inputProps={{ placeholder: 'End Date' }}
                      className="w-full"
                    />
                  </div>
                )}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full @xl:w-auto"
              >
                Create Coupon
              </Button>
            </div>
          </div>
        </>
      )}
    </Form>
  );
}
