'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ActionIcon, Alert, Button, Input, Loader, Modal, Switch, Text, Title, Tooltip } from 'rizzui';
import { PiPencilBold, PiPlusBold, PiXBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import { handleApiError } from '@/libs/axios';
import { usePickupLocations } from '@/hooks/queries/useSupport';
import {
  useCreatePickupLocation,
  useDeletePickupLocation,
  useUpdatePickupLocation,
} from '@/hooks/mutations/useSupportMutations';
import { PickupLocation, PickupLocationInput } from '@/types/support.types';

const pickupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
  phone: z.string().trim(),
  hours: z.string().trim(),
  readyIn: z.string().trim(),
  active: z.boolean(),
  order: z.number({ invalid_type_error: 'Order must be a whole number' }).int('Order must be a whole number'),
});

type PickupFormValues = z.infer<typeof pickupSchema>;

const toFormValues = (loc?: PickupLocation, nextOrder = 0): PickupFormValues => ({
  name: loc?.name ?? '',
  address: loc?.address ?? '',
  city: loc?.city ?? '',
  state: loc?.state ?? '',
  phone: loc?.phone ?? '',
  hours: loc?.hours ?? '',
  readyIn: loc?.readyIn ?? 'Ready in 1–2 business days',
  active: loc?.active ?? true,
  order: loc?.order ?? nextOrder,
});

const toPayload = (v: PickupFormValues): PickupLocationInput => ({
  name: v.name,
  address: v.address,
  city: v.city,
  state: v.state,
  phone: v.phone,
  hours: v.hours,
  readyIn: v.readyIn,
  active: v.active,
  order: v.order,
});

export default function PickupLocations() {
  const { data: locations = [], isLoading, error } = usePickupLocations();
  const [editing, setEditing] = useState<PickupLocation | 'new' | null>(null);
  const update = useUpdatePickupLocation();
  const { mutate: remove } = useDeletePickupLocation();
  const nextOrder = locations.length ? Math.max(...locations.map((l) => l.order ?? 0)) + 1 : 0;

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load pickup locations</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text className="max-w-2xl text-gray-500">
          Active locations are offered at checkout when the customer chooses pickup, in this order. With none set up,
          pickup uses the store address from Store Settings.
        </Text>
        <Button onClick={() => setEditing('new')}>
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add location
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-muted py-16">
          <Title as="h5">No pickup locations yet</Title>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-100">
              <tr>
                <th className="w-16 px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Ready in</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc) => (
                <tr key={loc._id} className="border-t border-muted align-top">
                  <td className="px-4 py-3 text-gray-600">{loc.order}</td>
                  <td className="px-4 py-3">
                    <Text className="font-medium">{loc.name}</Text>
                    <Text className="text-gray-500">
                      {loc.address}, {loc.city}, {loc.state}
                    </Text>
                    {loc.phone && <Text className="text-xs text-gray-500">{loc.phone}</Text>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{loc.hours || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{loc.readyIn || '—'}</td>
                  <td className="px-4 py-3">
                    <Switch
                      aria-label={`${loc.name} active`}
                      checked={loc.active}
                      disabled={update.isPending}
                      onChange={(e) => update.mutate({ id: loc._id, data: { active: e.target.checked } })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip content="Edit" placement="top">
                        <ActionIcon size="sm" variant="outline" onClick={() => setEditing(loc)} aria-label="Edit location">
                          <PiPencilBold className="h-4 w-4" />
                        </ActionIcon>
                      </Tooltip>
                      <DeletePopover
                        title="Delete pickup location"
                        description={`Delete "${loc.name}"? Past orders keep their copy of the address.`}
                        onDelete={() => remove(loc._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} size="lg">
        {editing !== null && (
          <PickupLocationForm
            location={editing === 'new' ? undefined : editing}
            nextOrder={nextOrder}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function PickupLocationForm({
  location,
  nextOrder,
  onDone,
}: {
  location?: PickupLocation;
  nextOrder: number;
  onDone: () => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PickupFormValues>({
    resolver: zodResolver(pickupSchema),
    defaultValues: toFormValues(location, nextOrder),
  });
  const createMutation = useCreatePickupLocation({ onSuccess: onDone });
  const updateMutation = useUpdatePickupLocation({ onSuccess: onDone });

  const onSubmit = (values: PickupFormValues) => {
    const payload = toPayload(values);
    if (location) updateMutation.mutate({ id: location._id, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          {location ? 'Edit pickup location' : 'New pickup location'}
        </Title>
        <ActionIcon size="sm" variant="text" onClick={onDone} aria-label="Close">
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>
      <Input label="Name" placeholder="Lekki showroom" {...register('name')} error={errors.name?.message} />
      <Input label="Address" placeholder="12 Admiralty Way" {...register('address')} error={errors.address?.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="City" {...register('city')} error={errors.city?.message} />
        <Input label="State" {...register('state')} error={errors.state?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Phone (optional)" {...register('phone')} />
        <Input label="Hours (optional)" placeholder="Mon–Sat, 10am–6pm" {...register('hours')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Ready in" placeholder="Ready in 1–2 business days" {...register('readyIn')} />
        <Input
          type="number"
          label="Order"
          helperText="Lower numbers are listed first."
          {...register('order', { valueAsNumber: true })}
          error={errors.order?.message}
        />
      </div>
      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <Switch
            label={field.value ? 'Offered at checkout' : 'Hidden at checkout'}
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
          {location ? 'Save location' : 'Create location'}
        </Button>
      </div>
    </form>
  );
}
