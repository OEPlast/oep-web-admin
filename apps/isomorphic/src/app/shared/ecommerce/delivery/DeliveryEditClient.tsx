'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Input, Select, Badge, Text } from 'rizzui';
import { handleApiError } from '@/libs/axios';
import { useDeliveryAddTracking, useDeliveryUpdateStatus } from '@/hooks/mutations/useDelivery';
import { useDeliveryById } from '@/hooks/queries/useDeliveries';
import { routes } from '@/config/routes';

// Courier can only change to these statuses
const COURIER_ALLOWED_STATUSES = ['Dispatched', 'In-Transit', 'Delivered', 'Returned', 'Failed'];

export default function DeliveryEditClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: delivery, isLoading, error, isError } = useDeliveryById(id);

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [trackingLocation, setTrackingLocation] = useState('');
  const [trackingDescription, setTrackingDescription] = useState('');

  const updateStatus = useDeliveryUpdateStatus(id);
  const addTracking = useDeliveryAddTracking(id);

  if (isLoading) return <div className="p-6">Loading delivery...</div>;
  if (isError)
    return (
      <Alert color="danger" className="mb-4">
        <strong>Error:</strong> {handleApiError(error)}
      </Alert>
    );
  if (!delivery) return <div className="p-6">Delivery not found</div>;

  const isDelivered = delivery.status === 'Delivered';

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    updateStatus.mutate(
      { status: selectedStatus as any },
      {
        onSuccess: () => {
          setSelectedStatus('');
        },
      }
    );
  };

  const handleAddTracking = () => {
    if (!trackingLocation || !trackingDescription) return;
    addTracking.mutate(
      {
        status: delivery.status,
        location: trackingLocation,
        description: trackingDescription,
      },
      {
        onSuccess: () => {
          setTrackingLocation('');
          setTrackingDescription('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Current Status</h3>
        <Badge size="lg" className="text-base">
          {delivery.status}
        </Badge>
      </div>

      {/* Update Status */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Update Status</h3>
        <div className="flex gap-3">
          <Select
            disabled={isDelivered || updateStatus.isPending}
            value={selectedStatus}
            onChange={(value: any) => setSelectedStatus(value.value)}
            options={COURIER_ALLOWED_STATUSES.map((s) => ({ label: s, value: s }))}
            placeholder="Select new status"
          />
          <Button
            disabled={isDelivered || updateStatus.isPending || !selectedStatus}
            isLoading={updateStatus.isPending}
            onClick={handleStatusUpdate}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Add Tracking Update */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Add Tracking Update</h3>
        <div className="grid gap-3">
          <Input
            label="Location"
            placeholder="Enter location (e.g., Distribution Center, City)"
            disabled={isDelivered || addTracking.isPending}
            value={trackingLocation}
            onChange={(e) => setTrackingLocation(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Enter tracking description"
            disabled={isDelivered || addTracking.isPending}
            value={trackingDescription}
            onChange={(e) => setTrackingDescription(e.target.value)}
          />
          <Button
            disabled={isDelivered || addTracking.isPending || !trackingLocation || !trackingDescription}
            isLoading={addTracking.isPending}
            onClick={handleAddTracking}
          >
            Add Tracking
          </Button>
        </div>
      </div>

      {/* Tracking History */}
      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-semibold">Tracking History</h3>
        {delivery.trackingHistory && delivery.trackingHistory.length > 0 ? (
          <div className="space-y-4">
            {delivery.trackingHistory.map((entry: any, index: number) => (
              <div key={index} className="border-l-4 border-gray-300 pl-4">
                <div className="flex justify-between">
                  <Text className="font-semibold text-gray-900">{entry.location}</Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                </div>
                <Text className="text-gray-700">{entry.description}</Text>
              </div>
            ))}
          </div>
        ) : (
          <Text className="text-gray-500">No tracking history available</Text>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push(routes.eCommerce.delivery.details(id))}>
          Back to Details
        </Button>
      </div>
    </div>
  );
}
