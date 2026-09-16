'use client';

import { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Button, Select, Textarea, Alert } from 'rizzui';
import axios from 'axios';
import { Form } from '@core/ui/form';
import { returnStatusUpdateSchema, ReturnStatusUpdateInput } from '@/validators/return-schema';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import { BackendValidationError, extractBackendErrors } from '@/libs/form-errors';
import { useUpdateReturnStatus } from '@/hooks/mutations/useUpdateReturnStatus';
import { handleApiError } from '@/libs/axios';
import toast from 'react-hot-toast';

interface ReturnStatusUpdateFormProps {
  returnId: string;
  currentStatus: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'items_received', label: 'Items Received' },
  { value: 'inspecting', label: 'Inspecting' },
  { value: 'inspection_passed', label: 'Inspection Passed' },
  { value: 'inspection_failed', label: 'Inspection Failed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// The moves the backend allows (Main-server services/returnService.ts RETURN_TRANSITIONS).
// `completed` is never set by hand: paying the refund is what completes a return.
function getAvailableStatuses(currentStatus: string) {
  const statusFlow: Record<string, string[]> = {
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['items_received', 'cancelled'],
    items_received: ['inspecting', 'inspection_passed', 'inspection_failed'],
    inspecting: ['inspection_passed', 'inspection_failed'],
    inspection_passed: [], // next step is the refund
    inspection_failed: ['rejected'], // or a refund with an override
    // Final states (no transitions)
    rejected: [],
    completed: [],
    cancelled: [],
  };

  const available = statusFlow[currentStatus] || [];
  return STATUS_OPTIONS.filter((opt) => available.includes(opt.value));
}

export default function ReturnStatusUpdateForm({
  returnId,
  currentStatus,
  onSuccess,
  onCancel,
}: ReturnStatusUpdateFormProps) {
  const [componentError, setComponentError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);

  const updateMutation = useUpdateReturnStatus(returnId, {
    onSuccess: (data: any) => {
      setComponentError(null);
      setApiErrors(null);
      toast.success('Return status updated successfully');
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = handleApiError(error);
      setComponentError(errorMessage);

      // Extract backend validation errors if available
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const backendErrors = extractBackendErrors(error.response.data);
        if (backendErrors) {
          setApiErrors(backendErrors);
        }
      }
    },
  });

  const availableStatuses = getAvailableStatuses(currentStatus);

  const handleSubmit = (data: ReturnStatusUpdateInput) => {
    setComponentError(null);
    setApiErrors(null);
    updateMutation.mutate(data);
  };

  return (
    <Form<ReturnStatusUpdateInput>
      validationSchema={returnStatusUpdateSchema}
      onSubmit={handleSubmit}
      useFormProps={{
        mode: 'onSubmit',
        defaultValues: {
          status: currentStatus as ReturnStatusUpdateInput['status'],
          adminNotes: '',
        },
      }}
      className="flex flex-col gap-6"
    >
      {({ register, control, formState: { errors, isSubmitting }, setError }) => {
        // Set backend errors when apiErrors changes
          if (apiErrors && apiErrors.length > 0) {
            apiErrors.forEach((error) => {
              if (error.path && error.msg) {
                setError(error.path as any, {
                  type: 'manual',
                  message: error.msg,
                });
              }
            });
          }

        return (
          <>
            {/* Display component-level error */}
            {componentError && (
              <Alert color="danger" className="mb-4">
                <strong>Error:</strong> {componentError}
              </Alert>
            )}

            {/* Current Status Display */}
            <VerticalFormBlockWrapper
              title="Current Status"
              description={`Return is currently in "${currentStatus}" status`}
            >
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  Current: <span className="text-gray-900">{currentStatus}</span>
                </p>
              </div>
            </VerticalFormBlockWrapper>

            {/* Status Selection */}
            <VerticalFormBlockWrapper
              title="Update Status"
              description="Select the new status for this return"
            >
              <Controller
                name="status"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    options={availableStatuses}
                    value={value}
                    onChange={onChange}
                    placeholder="Select new status"
                    error={errors.status?.message as string}
                    getOptionValue={(option) => option.value}
                    displayValue={(selected: unknown) => {
                      const selectedStr = String(selected);
                      return STATUS_OPTIONS.find((opt) => opt.value === selectedStr)?.label ?? selectedStr;
                    }}
                    disabled={availableStatuses.length === 0 || isSubmitting}
                  />
                )}
              />
              {availableStatuses.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                 {`No status transitions available from "${currentStatus}"`}
                </p>
              )}
            </VerticalFormBlockWrapper>

            {/* Admin Notes */}
            <VerticalFormBlockWrapper
              title="Admin Notes"
              description="Add notes about this status update (optional)"
            >
              <Textarea
                {...register('adminNotes')}
                placeholder="e.g., Items inspected and confirmed defective"
                rows={4}
                error={errors.adminNotes?.message as string}
              />
            </VerticalFormBlockWrapper>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting || updateMutation.isPending}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                isLoading={isSubmitting || updateMutation.isPending}
                disabled={availableStatuses.length === 0}
              >
                Update Status
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
