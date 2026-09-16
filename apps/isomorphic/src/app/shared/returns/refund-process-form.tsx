'use client';

import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Button, Input, Select, Textarea, Alert, Switch } from 'rizzui';
import axios from 'axios';
import { Form } from '@core/ui/form';
import { refundProcessSchema, RefundProcessInput } from '@/validators/return-schema';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import { BackendValidationError, extractBackendErrors } from '@/libs/form-errors';
import { useProcessRefund } from '@/hooks/mutations/useProcessRefund';
import { handleApiError } from '@/libs/axios';

const formatCurrency = (value: number, currency = 'NGN') =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

interface RefundProcessFormProps {
  returnId: string;
  /** Naira. What the returned items were sold for; the default refund. */
  totalRefundAmount: number | null;
  /** Naira. The order total; a refund can't exceed it. */
  orderTotal?: number;
  currentStatus: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const REFUND_METHOD_OPTIONS = [
  { value: 'original_payment', label: 'Original payment (Paystack refund)' },
  { value: 'store_credit', label: 'Store credit (paid outside Paystack)' },
  { value: 'bank_transfer', label: 'Manual bank transfer' },
];

/** Refund without an override only after the goods came back and passed inspection. */
const REFUNDABLE = ['inspection_passed'];
/** Refund with a written override: the goods are waived (e.g. not worth shipping back). */
const OVERRIDABLE = ['approved', 'items_received', 'inspecting', 'inspection_failed'];

export default function RefundProcessForm({
  returnId,
  totalRefundAmount,
  orderTotal,
  currentStatus,
  onSuccess,
  onCancel,
}: RefundProcessFormProps) {
  const [componentError, setComponentError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);

  const processRefundMutation = useProcessRefund(returnId, {
    onSuccess: () => {
      setComponentError(null);
      setApiErrors(null);
      onSuccess?.();
    },
    onError: (error: Error) => {
      setComponentError(handleApiError(error));
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const backendErrors = extractBackendErrors(error.response.data);
        if (backendErrors) setApiErrors(backendErrors);
      }
    },
  });

  const passedInspection = REFUNDABLE.includes(currentStatus);
  const needsOverride = !passedInspection && OVERRIDABLE.includes(currentStatus);
  const canProcessRefund = passedInspection || needsOverride;

  const handleSubmit = (data: RefundProcessInput) => {
    setComponentError(null);
    setApiErrors(null);
    processRefundMutation.mutate({
      ...data,
      override: needsOverride ? true : undefined,
      overrideReason: needsOverride ? data.overrideReason : undefined,
    });
  };

  return (
    <Form<RefundProcessInput>
      validationSchema={refundProcessSchema}
      onSubmit={handleSubmit}
      useFormProps={{
        mode: 'onSubmit',
        defaultValues: {
          refundAmount: totalRefundAmount || 0,
          refundMethod: 'original_payment',
          adminNotes: '',
          override: needsOverride,
          overrideReason: '',
        },
      }}
      className="flex flex-col gap-6"
    >
      {({ register, control, watch, formState: { errors, isSubmitting }, setError }) => {
        if (apiErrors && apiErrors.length > 0) {
          apiErrors.forEach((error) => {
            if (error.path && error.msg) setError(error.path as any, { type: 'manual', message: error.msg });
          });
        }
        const method = watch('refundMethod');

        return (
          <>
            {componentError && (
              <Alert color="danger" className="mb-4">
                <strong>Error:</strong> {componentError}
              </Alert>
            )}

            {!canProcessRefund && (
              <Alert color="warning" className="mb-4">
                A refund needs the returned items to pass inspection first. Current status:{' '}
                <strong>{currentStatus.replace('_', ' ')}</strong>.
              </Alert>
            )}

            {needsOverride && (
              <Alert color="warning" className="mb-4">
                The items have <strong>not passed inspection</strong>. Refunding now waives the goods; say why
                below. The reason is kept on the return.
              </Alert>
            )}

            <VerticalFormBlockWrapper title="Refund amount" description="In naira. Defaults to what the returned items were sold for.">
              <Input
                type="number"
                step="0.01"
                {...register('refundAmount', { valueAsNumber: true })}
                prefix="₦"
                error={errors.refundAmount?.message as string}
                disabled={!canProcessRefund || isSubmitting}
              />
              <p className="mt-2 text-sm text-gray-500">
                Items: {formatCurrency(totalRefundAmount || 0)}
                {typeof orderTotal === 'number' ? ` · Order total: ${formatCurrency(orderTotal)} (maximum)` : ''}
              </p>
            </VerticalFormBlockWrapper>

            <VerticalFormBlockWrapper title="Refund method" description="Original payment goes to Paystack now and completes when Paystack confirms it. The other two record a payout you make yourself.">
              <Controller
                name="refundMethod"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    options={REFUND_METHOD_OPTIONS}
                    value={value}
                    onChange={onChange}
                    placeholder="Select refund method"
                    error={errors.refundMethod?.message as string}
                    getOptionValue={(option) => option.value}
                    displayValue={(selected: string) => REFUND_METHOD_OPTIONS.find((opt) => opt.value === selected)?.label ?? selected}
                    disabled={!canProcessRefund || isSubmitting}
                  />
                )}
              />
              {method !== 'original_payment' && (
                <p className="mt-2 text-sm text-gray-500">
                  Recorded as paid immediately. Make sure the customer has actually received it.
                </p>
              )}
            </VerticalFormBlockWrapper>

            {needsOverride && (
              <VerticalFormBlockWrapper title="Override reason" description="Why the refund is being paid without a passed inspection.">
                <Textarea
                  {...register('overrideReason')}
                  placeholder="e.g. Item arrived damaged; customer sent photos; not worth shipping back"
                  error={errors.overrideReason?.message as string}
                  disabled={isSubmitting}
                />
              </VerticalFormBlockWrapper>
            )}

            <VerticalFormBlockWrapper title="Notes" description="Shown to the customer in the refund email.">
              <Textarea
                {...register('adminNotes')}
                placeholder="e.g. Refund for the damaged bucket"
                error={errors.adminNotes?.message as string}
                disabled={!canProcessRefund || isSubmitting}
              />
            </VerticalFormBlockWrapper>

            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  Cancel
                </Button>
              )}
              <Button type="submit" isLoading={isSubmitting || processRefundMutation.isPending} disabled={!canProcessRefund}>
                {method === 'original_payment' ? 'Request refund from Paystack' : 'Record refund'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
