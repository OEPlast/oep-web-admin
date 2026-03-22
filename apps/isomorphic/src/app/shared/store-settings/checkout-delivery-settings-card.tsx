'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Checkbox, Input } from 'rizzui';
import { useGIGConfig } from '@/hooks/queries/useGIGConfig';
import { useUpdateGIGConfig } from '@/hooks/mutations/useGIGConfigMutation';
import { handleApiError } from '@/libs/axios';

const deliveryMethodSchema = z.enum(['shipping', 'pickup', 'gig']);

const checkoutDeliverySettingsSchema = z
  .object({
    enabledDeliveryMethods: z
      .array(deliveryMethodSchema)
      .min(1, 'Select at least one delivery method'),
    shippingDiscountAmountOff: z.coerce
      .number()
      .min(0, 'Shipping discount percentage must be zero or more')
      .max(100, 'Shipping discount percentage cannot exceed 100')
      .default(0),
    gigDiscountAmountOff: z.coerce
      .number()
      .min(0, 'GIG discount percentage must be zero or more')
      .max(100, 'GIG discount percentage cannot exceed 100')
      .default(0),
    freeShippingEnabled: z.boolean().default(false),
    freeShippingThresholdAmount: z.coerce
      .number()
      .min(0, 'Free shipping threshold must be zero or more')
      .optional(),
    shippingMinDeliveryDays: z.coerce
      .number()
      .min(0, 'Minimum delivery days must be zero or more')
      .default(2),
    shippingMaxDeliveryDays: z.coerce
      .number()
      .min(0, 'Maximum delivery days must be zero or more')
      .default(5),
  })
  .refine(
    (data) => data.shippingMaxDeliveryDays >= data.shippingMinDeliveryDays,
    {
      path: ['shippingMaxDeliveryDays'],
      message:
        'Maximum delivery days must be greater than or equal to minimum days',
    }
  )
  .superRefine((data, ctx) => {
    if (
      data.freeShippingEnabled &&
      !Number.isFinite(data.freeShippingThresholdAmount)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['freeShippingThresholdAmount'],
        message: 'Free shipping threshold amount is required when enabled',
      });
    }
  });

type CheckoutDeliverySettingsData = z.infer<
  typeof checkoutDeliverySettingsSchema
>;

export default function CheckoutDeliverySettingsCard() {
  const [formError, setFormError] = useState<string | null>(null);
  const { data: config, isLoading, isError, error } = useGIGConfig();

  const updateConfig = useUpdateGIGConfig({
    onSuccess: () => {
      setFormError(null);
    },
    onError: (mutationError) => {
      setFormError(handleApiError(mutationError));
    },
  });

  const {
    watch,
    setValue,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutDeliverySettingsData>({
    resolver: zodResolver(checkoutDeliverySettingsSchema),
    defaultValues: {
      enabledDeliveryMethods: ['shipping', 'pickup', 'gig'],
      shippingDiscountAmountOff: 0,
      gigDiscountAmountOff: 0,
      freeShippingEnabled: false,
      freeShippingThresholdAmount: 0,
      shippingMinDeliveryDays: 2,
      shippingMaxDeliveryDays: 5,
    },
  });

  useEffect(() => {
    if (!config) {
      return;
    }

    reset({
      enabledDeliveryMethods: config.enabledDeliveryMethods || [
        'shipping',
        'pickup',
        'gig',
      ],
      shippingDiscountAmountOff: config.shippingDiscountAmountOff ?? 0,
      gigDiscountAmountOff: config.gigDiscountAmountOff ?? 0,
      freeShippingEnabled: Number.isFinite(config.freeShippingThreshold),
      freeShippingThresholdAmount: config.freeShippingThreshold ?? 0,
      shippingMinDeliveryDays: config.shippingMinDeliveryDays ?? 2,
      shippingMaxDeliveryDays: config.shippingMaxDeliveryDays ?? 5,
    });
  }, [config, reset]);

  const enabledDeliveryMethods = watch('enabledDeliveryMethods');
  const freeShippingEnabled = watch('freeShippingEnabled');

  const toggleDeliveryMethod = (
    method: z.infer<typeof deliveryMethodSchema>
  ) => {
    const currentMethods = enabledDeliveryMethods ?? [];

    if (currentMethods.includes(method)) {
      const nextMethods = currentMethods.filter((value) => value !== method);
      setValue('enabledDeliveryMethods', nextMethods, { shouldValidate: true });
      return;
    }

    setValue('enabledDeliveryMethods', [...currentMethods, method], {
      shouldValidate: true,
    });
  };

  const onSubmit = (data: CheckoutDeliverySettingsData) => {
    setFormError(null);
    updateConfig.mutate({
      enabledDeliveryMethods: data.enabledDeliveryMethods,
      shippingDiscountAmountOff: data.shippingDiscountAmountOff,
      gigDiscountAmountOff: data.gigDiscountAmountOff,
      freeShippingThreshold: data.freeShippingEnabled
        ? (data.freeShippingThresholdAmount ?? 0)
        : null,
      shippingMinDeliveryDays: data.shippingMinDeliveryDays,
      shippingMaxDeliveryDays: data.shippingMaxDeliveryDays,
    });
  };

  if (isLoading) {
    return null;
  }

  if (isError && error) {
    return (
      <div className="rounded-lg border border-muted p-6">
        <Alert color="danger">
          <strong>Error loading delivery settings:</strong>{' '}
          {handleApiError(error)}
        </Alert>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-lg border border-muted p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Checkout Delivery Settings
        </h3>
        <Alert color="info">
          Configure GIG first in the GIG configuration page, then manage
          checkout delivery settings here.
        </Alert>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-muted p-6">
      <h3 className="mb-4 text-lg font-semibold">Checkout Delivery Settings</h3>

      {formError && (
        <Alert color="danger" className="mb-4">
          <strong>Error:</strong> {formError}
        </Alert>
      )}

      <div className="grid gap-4 @md:grid-cols-2">
        <div className="@md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Enabled Delivery Methods
          </label>
          <div className="flex flex-wrap gap-4">
            <Checkbox
              label="Shipping"
              checked={enabledDeliveryMethods?.includes('shipping')}
              onChange={() => toggleDeliveryMethod('shipping')}
              variant="flat"
            />
            <Checkbox
              label="Pickup"
              checked={enabledDeliveryMethods?.includes('pickup')}
              onChange={() => toggleDeliveryMethod('pickup')}
              variant="flat"
            />
            <Checkbox
              label="GIG Logistics"
              checked={enabledDeliveryMethods?.includes('gig')}
              onChange={() => toggleDeliveryMethod('gig')}
              variant="flat"
            />
          </div>
          {errors.enabledDeliveryMethods && (
            <p className="mt-1 text-sm text-red-600">
              {errors.enabledDeliveryMethods.message}
            </p>
          )}
        </div>

        <Input
          label="Shipping Discount Percentage Off (%)"
          type="number"
          min={0}
          max={100}
          step="0.01"
          {...register('shippingDiscountAmountOff', { valueAsNumber: true })}
          error={errors.shippingDiscountAmountOff?.message}
        />

        <Input
          label="GIG Discount Percentage Off (%)"
          type="number"
          min={0}
          max={100}
          step="0.01"
          {...register('gigDiscountAmountOff', { valueAsNumber: true })}
          error={errors.gigDiscountAmountOff?.message}
        />

        <div className="rounded-md border border-muted p-4 @md:col-span-2">
          <Checkbox
            label="Enable Free Shipping Threshold"
            checked={freeShippingEnabled}
            onChange={(event) => {
              setValue('freeShippingEnabled', event.target.checked, {
                shouldValidate: true,
              });
            }}
            variant="flat"
          />

          {freeShippingEnabled ? (
            <div className="mt-3 max-w-sm">
              <Input
                label="Free Shipping Threshold Amount"
                type="number"
                min={0}
                step="0.01"
                {...register('freeShippingThresholdAmount', {
                  valueAsNumber: true,
                })}
                error={errors.freeShippingThresholdAmount?.message}
              />
            </div>
          ) : null}
        </div>

        <Input
          label="Shipping Minimum Delivery Days"
          type="number"
          min={0}
          {...register('shippingMinDeliveryDays', { valueAsNumber: true })}
          error={errors.shippingMinDeliveryDays?.message}
        />

        <Input
          label="Shipping Maximum Delivery Days"
          type="number"
          min={0}
          {...register('shippingMaxDeliveryDays', { valueAsNumber: true })}
          error={errors.shippingMaxDeliveryDays?.message}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          isLoading={updateConfig.isPending}
          disabled={updateConfig.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          {updateConfig.isPending ? 'Saving...' : 'Save Delivery Settings'}
        </Button>
      </div>
    </div>
  );
}
