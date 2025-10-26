'use client';

import { Button, Input, Select, Text, Switch, Alert } from 'rizzui';
import { Form } from '@core/ui/form';
import { FormLabelWithTooltip } from '@core/ui/form-label-with-tooltip';
import { Controller, ControllerRenderProps } from 'react-hook-form';
import { CreateCouponInput } from '@/data/coupon-data';
import { DatePicker } from '@core/ui/datepicker';
import QuantityInput from '@/app/shared/explore-flight/listing-filters/quantity-input';
import { useCreateCoupon } from '@/hooks/mutations/useCouponMutations';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import {
  BackendValidationError,
  extractBackendErrors,
  setBackendFormErrors,
} from '@/libs/form-errors';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

const couponTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'one-off', label: 'One-off' },
  { value: 'one-off-user', label: 'One-off per user' },
  { value: 'one-off-for-one-person', label: 'One-off for one person' },
];

const discountTypeOptions = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount' },
];

export default function CreateCoupon() {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(
    null
  );

  const createMutation = useCreateCoupon({
    onSuccess: () => {
      router.push(routes.eCommerce.coupons);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error.response.data);
        if (backendErrors) {
          setApiErrors(backendErrors);
        }
      }
    },
  });

  const onSubmit = (data: CreateCouponInput) => {
    setApiErrors(null); // Clear previous errors
    createMutation.mutate(data);
  };

  const description =
    'Fill in the details below to create a new coupon. Set the code, discount, type, and validity period.';

  return (
    <Form<CreateCouponInput>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        defaultValues: {
          coupon: '',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          discount: 10,
          discountType: 'percentage',
          minOrderValue: 0,
          active: true,
          couponType: 'normal',
          stackable: false,
        },
      }}
      className="isomorphic-form flex max-w-[700px] flex-col gap-6"
    >
      {({ register, control, watch, formState: { errors }, setError }) => {
        const discountType = watch('discountType');
        const couponType = watch('couponType');

        // Set backend errors when apiErrors changes
        useEffect(() => {
          if (apiErrors) {
            setBackendFormErrors(apiErrors, setError);
            setApiErrors(null); // Clear after setting
          }
        }, [apiErrors]);

        return (
          <>
            <div className="col-span-2 mb-1 pe-4 @5xl:mb-0">
              <Text className="mt-1 text-sm text-gray-500">{description}</Text>
            </div>
            <div className="flex flex-col gap-6">
              {/* Coupon Code */}
              <Input
                label={
                  <FormLabelWithTooltip
                    label="Coupon Code"
                    tooltip="Unique code customers will enter at checkout. Use uppercase letters, numbers, hyphens, or underscores."
                    required
                  />
                }
                placeholder="SUMMER2025"
                {...register('coupon', {
                  required: 'Coupon code is required',
                  minLength: {
                    value: 3,
                    message: 'Code must be at least 3 characters',
                  },
                })}
                error={errors.coupon?.message}
              />

              {/* Discount Amount & Type */}
              <div className="flex gap-4">
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={
                        <FormLabelWithTooltip
                          label="Discount Type"
                          tooltip="Choose between percentage discount (e.g., 10% off) or fixed amount (e.g., $5 off)."
                          required
                        />
                      }
                      options={discountTypeOptions}
                      value={field.value}
                      onChange={(
                        value: ControllerRenderProps<
                          CreateCouponInput,
                          'discountType'
                        >
                      ) => field.onChange(value?.value || value)}
                      error={errors.discountType?.message as string}
                      className="flex-1"
                    />
                  )}
                />
                <Controller
                  name="discount"
                  control={control}
                  rules={{
                    required: 'Discount is required',
                    min: { value: 0.01, message: 'Discount must be positive' },
                  }}
                  render={({ field }) => (
                    <div className="flex-1">
                      <FormLabelWithTooltip
                        label={`Amount${discountType === 'percentage' ? ' (%)' : ' ($)'}`}
                        tooltip="The discount value. For percentage: 0.01-100%. For fixed: minimum $0.01."
                        required
                      />
                      <QuantityInput
                        max={discountType === 'percentage' ? 100 : undefined}
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
              </div>

              {/* Coupon Type */}
              <Controller
                name="couponType"
                control={control}
                render={({ field }) => (
                  <Select
                    label={
                      <FormLabelWithTooltip
                        label="Coupon Type"
                        tooltip="Normal: reusable. One-off: single use total. One-off-user: one use per customer. One-off-for-one-person: specific user only."
                        required
                      />
                    }
                    options={couponTypeOptions}
                    value={field.value}
                    onChange={(
                      value: ControllerRenderProps<
                        CreateCouponInput,
                        'couponType'
                      >
                    ) => field.onChange(value?.value || value)}
                    error={errors.couponType?.message as string}
                  />
                )}
              />

              {/* Allowed User - Only for one-off-for-one-person */}
              {couponType === 'one-off-for-one-person' && (
                <Input
                  label={
                    <FormLabelWithTooltip
                      label="Allowed User ID"
                      tooltip="Enter the specific user ID who is allowed to use this coupon. Only this user can redeem it once."
                      required
                    />
                  }
                  placeholder="Enter user ID"
                  {...register('allowedUser', {
                    required:
                      couponType === 'one-off-for-one-person'
                        ? 'User ID is required for this coupon type'
                        : false,
                  })}
                  error={errors.allowedUser?.message}
                />
              )}

              {/* Start and End Dates */}
              <div className="flex gap-4">
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <div className="flex-1">
                      <FormLabelWithTooltip
                        label="Start Date"
                        tooltip="When this coupon becomes active and available for use."
                        required
                      />
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        dateFormat="yyyy-MM-dd"
                        inputProps={{ placeholder: 'Start Date' }}
                        className="w-full"
                      />
                      {errors.startDate && (
                        <Text className="mt-1 text-sm text-red-500">
                          {errors.startDate.message}
                        </Text>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <div className="flex-1">
                      <FormLabelWithTooltip
                        label="End Date"
                        tooltip="When this coupon expires and can no longer be used."
                        required
                      />
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        dateFormat="yyyy-MM-dd"
                        inputProps={{ placeholder: 'End Date' }}
                        className="w-full"
                      />
                      {errors.endDate && (
                        <Text className="mt-1 text-sm text-red-500">
                          {errors.endDate.message}
                        </Text>
                      )}
                    </div>
                  )}
                />
              </div>

              {/* Min Order Value */}
              <Controller
                name="minOrderValue"
                control={control}
                render={({ field }) => (
                  <div>
                    <FormLabelWithTooltip
                      label="Minimum Order Value ($)"
                      tooltip="The minimum cart subtotal required to use this coupon. Set to 0 for no minimum."
                    />
                    <QuantityInput
                      variantType={'outline'}
                      className="w-full"
                      name={field.name}
                      defaultValue={field.value || 0}
                      onChange={field.onChange}
                      error={errors.minOrderValue?.message}
                    />
                  </div>
                )}
              />

              {/* Max Usage */}
              <Controller
                name="maxUsage"
                control={control}
                render={({ field }) => (
                  <div>
                    <FormLabelWithTooltip
                      label="Maximum Total Usage"
                      tooltip="Total number of times this coupon can be used across all customers. Leave at 0 or empty for unlimited."
                    />
                    <QuantityInput
                      variantType={'outline'}
                      className="w-full"
                      name={field.name}
                      defaultValue={field.value || 0}
                      onChange={field.onChange}
                      error={errors.maxUsage?.message}
                    />
                  </div>
                )}
              />

              {/* Max Usage Per User */}
              <Controller
                name="maxUsagePerUser"
                control={control}
                render={({ field }) => (
                  <div>
                    <FormLabelWithTooltip
                      label="Maximum Usage Per User"
                      tooltip="How many times each individual customer can use this coupon. Leave at 0 or empty for unlimited per user."
                    />
                    <QuantityInput
                      variantType={'outline'}
                      className="w-full"
                      name={field.name}
                      defaultValue={field.value || 0}
                      onChange={field.onChange}
                      error={errors.maxUsagePerUser?.message}
                    />
                  </div>
                )}
              />

              {/* Active & Stackable Switches */}
              <div className="flex gap-6">
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <FormLabelWithTooltip
                        label="Active"
                        tooltip="Whether this coupon is currently active and can be used by customers."
                      />
                      <Switch checked={field.value} onChange={field.onChange} />
                    </div>
                  )}
                />

                <Controller
                  name="stackable"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <FormLabelWithTooltip
                        label="Stackable"
                        tooltip="Allow this coupon to be combined with other coupons in the same order."
                      />
                      <Switch checked={field.value} onChange={field.onChange} />
                    </div>
                  )}
                />
              </div>

              {/* Notes */}
              <Input
                label={
                  <FormLabelWithTooltip
                    label="Notes (Optional)"
                    tooltip="Internal notes or description about this coupon. Not visible to customers."
                  />
                }
                placeholder="Internal notes about this coupon..."
                {...register('notes')}
                error={errors.notes?.message}
              />

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  isLoading={createMutation.isPending}
                  className="w-full @xl:w-auto"
                >
                  Create Coupon
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </Form>
  );
}
