'use client';

import { Button, Input, Select, Text, Switch, Loader } from 'rizzui';
import { Form } from '@core/ui/form';
import { FormLabelWithTooltip } from '@core/ui/form-label-with-tooltip';
import { Controller } from 'react-hook-form';
import { UpdateCouponInput } from '@/data/coupon-data';
import { DatePicker } from '@core/ui/datepicker';
import QuantityInput from '@/app/shared/explore-flight/listing-filters/quantity-input';
import { useCoupon } from '@/hooks/queries/useCoupons';
import {
  useUpdateCoupon,
  useDeleteCoupon,
} from '@/hooks/mutations/useCouponMutations';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import {
  BackendValidationError,
  extractBackendErrors,
  setBackendFormErrors,
} from '@/libs/form-errors';
import { useState, useEffect } from 'react';
import axios from 'axios';

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

export default function EditCoupon({ id }: { id: string }) {
  const router = useRouter();
  const { data: couponData, isLoading: fetching, error } = useCoupon(id);
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(
    null
  );

  const updateMutation = useUpdateCoupon({
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

  const deleteMutation = useDeleteCoupon({
    onSuccess: () => {
      router.push(routes.eCommerce.coupons);
    },
  });

  const onSubmit = (data: UpdateCouponInput) => {
    setApiErrors(null); // Clear previous errors
    updateMutation.mutate({ id, data });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteMutation.mutate(id);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error || !couponData) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading coupon: {error?.message || 'Coupon not found'}
      </div>
    );
  }

  const isDeleted = couponData.deleted;

  return (
    <Form<UpdateCouponInput>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        defaultValues: {
          coupon: couponData.coupon,
          startDate: new Date(couponData.startDate),
          endDate: new Date(couponData.endDate),
          discount: couponData.discount,
          discountType: couponData.discountType || 'percentage',
          minOrderValue: couponData.minOrderValue || 0,
          active: couponData.active,
          couponType: couponData.couponType,
          stackable: couponData.stackable || false,
          maxUsage: couponData.maxUsage || undefined,
          maxUsagePerUser: couponData.maxUsagePerUser || undefined,
          allowedUser: couponData.allowedUser || '',
          notes: couponData.notes || '',
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
            <div className="col-span-2 mb-1 flex flex-col gap-2 @5xl:mb-0">
              {isDeleted && (
                <Text className="mt-2 text-base font-semibold text-red-600">
                  This coupon is deleted
                </Text>
              )}
              <Text className="text-sm text-gray-500">
                Times Used: {couponData.timesUsed}
              </Text>
            </div>

            <div className="flex flex-col gap-6">
              {/* Active Switch */}
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <FormLabelWithTooltip
                      label="Active State"
                      tooltip="Whether this coupon is currently active and can be used by customers."
                      placement="right-start"
                    />
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isDeleted}
                    />
                  </div>
                )}
              />

              {/* Coupon Code */}
              <Input
                label={
                  <FormLabelWithTooltip
                    label="Coupon Code"
                    tooltip="Unique code customers will enter at checkout. Use uppercase letters, numbers, hyphens, or underscores."
                    required
                    placement="right-start"
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
                disabled={isDeleted}
                readOnly={isDeleted}
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
                          placement="right-start"
                        />
                      }
                      options={discountTypeOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.discountType?.message as string}
                      className="flex-1"
                      disabled={isDeleted}
                    />
                  )}
                />
                <Controller
                  name="discount"
                  control={control}
                  rules={{
                    required: 'Discount is required',
                    min: { value: 0, message: 'Discount must be positive' },
                  }}
                  render={({ field }) => (
                    <div className="flex-1">
                      <FormLabelWithTooltip
                        label={`Discount Amount${discountType === 'percentage' ? ' (%)' : ' ($)'}`}
                        tooltip="The discount value. For percentage: 0.01-100%. For fixed: minimum $0.01."
                        required
                        placement="right-start"
                      />
                      <QuantityInput
                        max={discountType === 'percentage' ? 100 : undefined}
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
                        placement="right-start"
                      />
                    }
                    options={couponTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.couponType?.message as string}
                    disabled={isDeleted}
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
                      placement="right-start"
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
                  disabled={isDeleted}
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
                        placement="right-start"
                      />
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
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <div className="flex-1">
                      <FormLabelWithTooltip
                        label="End Date"
                        tooltip="When this coupon expires and can no longer be used."
                        required
                        placement="right-start"
                      />
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

              {/* Min Order Value */}
              <Controller
                name="minOrderValue"
                control={control}
                render={({ field }) => (
                  <div>
                    <FormLabelWithTooltip
                      label="Minimum Order Value ($)"
                      tooltip="The minimum cart subtotal required to use this coupon. Set to 0 for no minimum."
                      placement="right-start"
                    />
                    <QuantityInput
                      variantType={'outline'}
                      className="w-full"
                      name={field.name}
                      defaultValue={field.value || 0}
                      onChange={field.onChange}
                      error={errors.minOrderValue?.message}
                      disabled={isDeleted}
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
                      placement="right-start"
                    />
                    <QuantityInput
                      variantType={'outline'}
                      className="w-full"
                      name={field.name}
                      defaultValue={field.value || 0}
                      onChange={field.onChange}
                      error={errors.maxUsage?.message}
                      disabled={isDeleted}
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
                      placement="right-start"
                    />
                    <QuantityInput
                      variantType={'outline'}
                      className="w-full"
                      name={field.name}
                      defaultValue={field.value || 0}
                      onChange={field.onChange}
                      error={errors.maxUsagePerUser?.message}
                      disabled={isDeleted}
                    />
                  </div>
                )}
              />

              {/* Stackable Switch */}
              <Controller
                name="stackable"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <FormLabelWithTooltip
                      label="Stackable with other coupons"
                      tooltip="Allow this coupon to be combined with other coupons in the same order."
                      placement="right-start"
                    />
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isDeleted}
                    />
                  </div>
                )}
              />

              {/* Notes */}
              <Input
                label={
                  <FormLabelWithTooltip
                    label="Notes (Optional)"
                    tooltip="Internal notes or description about this coupon. Not visible to customers."
                    placement="right-start"
                  />
                }
                placeholder="Internal notes about this coupon..."
                {...register('notes')}
                error={errors.notes?.message}
                disabled={isDeleted}
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  isLoading={updateMutation.isPending}
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
                isLoading={deleteMutation.isPending}
                disabled={isDeleted || deleteMutation.isPending}
                onClick={handleDelete}
              >
                Delete Coupon
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
