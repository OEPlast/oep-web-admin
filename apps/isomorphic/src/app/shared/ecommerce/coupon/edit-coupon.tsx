'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Text, Switch } from 'rizzui';
import { Form } from '@core/ui/form';
import { Controller } from 'react-hook-form';
import { CouponDataType } from '@/data/coupon-data';
import { DatePicker } from '@core/ui/datepicker';
import QuantityInput from '@/app/shared/explore-flight/listing-filters/quantity-input';

const couponTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'one-off', label: 'One-off' },
  { value: 'one-off-user', label: 'One-off per user' },
];

// Simulate fetch coupon by id (replace with real API call)
async function fetchCouponById(id: string): Promise<CouponDataType> {
  // TODO: Replace with real API call
  // For now, return mock data
  return {
    coupon: 'SUMMER25',
    startDate: new Date(),
    endDate: new Date(),
    discount: 25,
    active: true,
    timesUsed: 3,
    couponType: 'normal',
    creator: '6623f1b2e1a2c3d4e5f6a7b8',
    deleted: false,
    createdAt: new Date(),
    _id: id,
  };
}

export default function EditCoupon({ id }: { id: string }) {
  const [isLoading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<CouponDataType | null>(
    null
  );
  const [fetching, setFetching] = useState(true);
  const [active, setActive] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setFetching(true);
    fetchCouponById(id).then((data) => {
      setInitialValues(data);
      setActive(data.deleted);
      setFetching(false);
    });
  }, [id]);

  const onSubmit = (data: CouponDataType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Here you would send data to your API
      console.log('editCoupon data ->', data);
    }, 600);
  };

  const handleDelete = async () => {
    setDeleting(true);
    // TODO: Replace with real API call
    await new Promise((res) => setTimeout(res, 700));
    setDeleting(false);
    setInitialValues((prev) => (prev ? { ...prev, deleted: true } : prev));
  };

  if (fetching || !initialValues) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading coupon data...
      </div>
    );
  }

  const isDeleted = initialValues.deleted;
  return (
    <Form<CouponDataType>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        defaultValues: initialValues,
      }}
      className="isomorphic-form flex max-w-[700px] flex-col gap-6"
    >
      {({ register, control, setValue, watch, formState: { errors } }) => (
        <>
          <div className="col-span-2 mb-1 flex flex-col gap-2 @5xl:mb-0">
            {isDeleted && (
              <Text className="mt-2 text-base font-semibold text-red-600">
                This coupon is deleted
              </Text>
            )}
          </div>
          <div className="flex flex-col gap-6">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <div className="flex flex-1 items-center gap-2">
                  <label className="block font-medium">Active State</label>
                  <Switch
                    checked={field.value}
                    onChange={(checked) => {
                      field.onChange(checked);
                    }}
                    disabled={isDeleted}
                  />
                </div>
              )}
            />
            <Input
              label="Coupon Code"
              placeholder="COUPON2025"
              {...register('coupon', { required: true })}
              error={errors.coupon?.message}
              disabled={isDeleted}
              readOnly={isDeleted}
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
                    disabled={isDeleted}
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
                  disabled={isDeleted}
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
                      inputProps={{
                        placeholder: 'Start Date',
                        disabled: isDeleted,
                        readOnly: isDeleted,
                      }}
                      className="w-full"
                      disabled={isDeleted}
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
                      inputProps={{
                        placeholder: 'End Date',
                        disabled: isDeleted,
                        readOnly: isDeleted,
                      }}
                      className="w-full"
                      disabled={isDeleted}
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
                disabled={isDeleted}
              >
                Save Changes
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              color="danger"
              className=""
              isLoading={deleting}
              disabled={isDeleted || deleting}
              onClick={handleDelete}
            >
              Delete Coupon
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
