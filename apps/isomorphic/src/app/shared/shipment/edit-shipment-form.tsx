'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea, Select } from 'rizzui';
import { useCouriers } from '@/hooks/queries/useCouriers';
import { useUpdateShipment, useShipment } from '@/hooks/use-shipment';
import {
  updateShipmentSchema,
  type UpdateShipmentFormData,
} from '@/validators/shipment-schema';
import { routes } from '@/config/routes';
import { SHIPMENT_STATUSES } from '@/types/shipment.types';

interface EditShipmentFormProps {
  shipmentId: string;
}

interface CourierOption {
  label: string;
  value: string;
  name: string;
  email: string;
  _id: string;
}

export default function EditShipmentForm({
  shipmentId,
}: EditShipmentFormProps) {
  const router = useRouter();
  const { data: shipment, isLoading } = useShipment(shipmentId);
  const { mutate: updateShipment, isPending } = useUpdateShipment(shipmentId);
  const { data: couriers } = useCouriers();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateShipmentFormData>({
    resolver: zodResolver(updateShipmentSchema),
  });

  const courierValue = watch('courierUser');

  const courierLabel = useMemo(() => {
    const selectedCourier = (couriers || []).find((c) => c._id === courierValue);
    return selectedCourier ? selectedCourier.name : '';
  }, [couriers, courierValue]);

  const courierLabelFull = useMemo(() => {
    const selectedCourier = (couriers || []).find((c) => c._id === courierValue);
    return selectedCourier
      ? selectedCourier.name
        ? `${selectedCourier.email} (${selectedCourier.name})`
        : selectedCourier.email
      : '';
  }, [couriers, courierValue]);

  // Set courier name when courierUser changes
  useEffect(() => {    
    if (courierLabel) {
      setValue('courier', courierLabel);
    }
  }, [courierLabel, setValue]);
  
  useEffect(() => {
    if (shipment) {
      reset({
        courier: shipment.courier,
        courierUser: shipment.courierUser,
        cost: shipment.cost,
        status: shipment.status,
        estimatedDelivery: shipment.estimatedDelivery
          ? new Date(shipment.estimatedDelivery).toISOString().split('T')[0]
          : undefined,
        actualDelivery: shipment.actualDelivery
          ? new Date(shipment.actualDelivery).toISOString().split('T')[0]
          : undefined,
        shippingAddress: shipment.shippingAddress,
        dimensions: shipment.dimensions,
        notes: shipment.notes,
      });
    }
  }, [shipment, reset]);

  const onSubmit = (data: UpdateShipmentFormData) => {
    updateShipment(data, {
      onSuccess: () => {
  router.push(routes.eCommerce.shipment.shipmentDetails(shipmentId));
      },
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading shipment...</div>;
  }

  if (!shipment) {
    return <div className="p-6 text-center">Shipment not found</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="text-sm text-gray-600">Tracking Number</div>
          <div className="text-lg font-semibold">{shipment.trackingNumber}</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Courier
            </label>
            <Select
              value={courierLabelFull}
              onChange={(value: CourierOption) => {
                // value is the entire option object with _id, name, email, etc.
                setValue('courierUser', value._id || value.value);
              }}
              options={(couriers || []).map((c) => ({ 
                label: c.name ? `${c.email} (${c.name})` : c.email,
                value: c._id,
                name: c.name,
                email: c.email,
                _id: c._id
              }))}
              placeholder="Select courier user"
            />
            <p className="mt-1 text-xs text-gray-500">Selecting will set courier ID</p>
            {/* Display courier name based on ID - editable */}
            <Input
              className="mt-2"
              placeholder="Courier name (editable)"
              {...register('courier')}
              error={errors.courier?.message}
            />
          </div>
          <Input
            label="Shipping Cost"
            type="number"
            step="0.01"
            {...register('cost', { valueAsNumber: true })}
            error={errors.cost?.message}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-900 focus:outline-none"
              {...register('status')}
            >
              {SHIPMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">
                {errors.status.message}
              </p>
            )}
          </div>
          <Input
            label="Estimated Delivery"
            type="date"
            {...register('estimatedDelivery')}
            error={errors.estimatedDelivery?.message}
          />
          <Input
            label="Actual Delivery"
            type="date"
            {...register('actualDelivery')}
            error={errors.actualDelivery?.message}
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Shipping Address</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="First Name"
            {...register('shippingAddress.firstName')}
            error={errors.shippingAddress?.firstName?.message}
          />
          <Input
            label="Last Name"
            {...register('shippingAddress.lastName')}
            error={errors.shippingAddress?.lastName?.message}
          />
          <Input
            label="Phone Number"
            {...register('shippingAddress.phoneNumber')}
            error={errors.shippingAddress?.phoneNumber?.message}
          />
          <Input
            label="Country"
            {...register('shippingAddress.country')}
            error={errors.shippingAddress?.country?.message}
          />
          <div className="md:col-span-2">
            <Input
              label="Address Line 1"
              {...register('shippingAddress.address1')}
              error={errors.shippingAddress?.address1?.message}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Address Line 2"
              {...register('shippingAddress.address2')}
              error={errors.shippingAddress?.address2?.message}
            />
          </div>
          <Input
            label="City"
            {...register('shippingAddress.city')}
            error={errors.shippingAddress?.city?.message}
          />
          <Input
            label="State/Province"
            {...register('shippingAddress.state')}
            error={errors.shippingAddress?.state?.message}
          />
          <Input
            label="Zip/Postal Code"
            {...register('shippingAddress.zipCode')}
            error={errors.shippingAddress?.zipCode?.message}
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Package Dimensions</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Input
            label="Length (cm)"
            type="number"
            step="0.01"
            {...register('dimensions.length', { valueAsNumber: true })}
            error={errors.dimensions?.length?.message}
          />
          <Input
            label="Width (cm)"
            type="number"
            step="0.01"
            {...register('dimensions.width', { valueAsNumber: true })}
            error={errors.dimensions?.width?.message}
          />
          <Input
            label="Height (cm)"
            type="number"
            step="0.01"
            {...register('dimensions.height', { valueAsNumber: true })}
            error={errors.dimensions?.height?.message}
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.01"
            {...register('dimensions.weight', { valueAsNumber: true })}
            error={errors.dimensions?.weight?.message}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Additional Notes</h3>
        <Textarea
          label="Notes"
          {...register('notes')}
          error={errors.notes?.message}
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(routes.eCommerce.shipment.shipmentDetails(shipmentId))
          }
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          Update Shipment
        </Button>
      </div>
    </form>
  );
}
