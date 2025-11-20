'use client';

import { Alert, Badge, Text } from 'rizzui';
import { useDeliveryById } from '@/hooks/queries/useDeliveries';
import { handleApiError } from '@/libs/axios';

export default function DeliveryDetailsClient({ id }: { id: string }) {
  const { data: delivery, isLoading, error, isError } = useDeliveryById(id);

  if (isLoading) return <div className="p-6">Loading delivery...</div>;
  if (isError)
    return (
      <Alert color="danger" className="mb-4">
        <strong>Error:</strong> {handleApiError(error)}
      </Alert>
    );
  if (!delivery) return <div className="p-6">Delivery not found</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Text className="text-3xl font-bold">{delivery.trackingNumber}</Text>
            <div className="mt-2">
              <Badge>{delivery.status}</Badge>
            </div>
          </div>
        </div>

        <h3 className="mb-4 text-lg font-semibold">Shipping Address</h3>
        <div className="space-y-1">
          <Text className="font-medium">
            {delivery.shippingAddress.firstName} {delivery.shippingAddress.lastName}
          </Text>
          <Text>{delivery.shippingAddress.phoneNumber}</Text>
          <Text>{delivery.shippingAddress.address1}</Text>
          {delivery.shippingAddress.address2 && <Text>{delivery.shippingAddress.address2}</Text>}
          <Text>
            {delivery.shippingAddress.city}, {delivery.shippingAddress.state} {delivery.shippingAddress.zipCode}
          </Text>
          <Text>{delivery.shippingAddress.country}</Text>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-6">
        <h3 className="mb-2 text-lg font-semibold">Notes</h3>
        <Text className="text-gray-700">{delivery.notes || 'No notes'}</Text>
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
    </div>
  );
}
