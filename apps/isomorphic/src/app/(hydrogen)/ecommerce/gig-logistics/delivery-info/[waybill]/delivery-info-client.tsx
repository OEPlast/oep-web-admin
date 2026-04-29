'use client';

import { Badge, Button, Loader, Text } from 'rizzui';
import { useGIGShipmentInfo } from '@/hooks/queries/useGIGConfig';
import { handleApiError } from '@/libs/axios';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

function Field({ label, value }: { label: string; value: string | number | boolean | undefined | null }) {
  return (
    <div>
      <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</Text>
      <Text className="mt-0.5 text-sm text-gray-900">{value != null && value !== '' ? String(value) : '—'}</Text>
    </div>
  );
}

export default function DeliveryInfoClient({ waybill }: { waybill: string }) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useGIGShipmentInfo(waybill);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader size="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Text className="text-red-600">Error: {handleApiError(error)}</Text>
        <Button className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const gigInfo = data?.gigTracking?.[0] ?? null;
  const shipment = data?.shipment ?? null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(routes.eCommerce.gigLogistics.deliveryTracking)}
        >
          ← Back
        </Button>
        <div className="flex-1">
          <Text className="text-2xl font-bold">Delivery Info</Text>
          <Text className="font-mono text-sm text-gray-500">{waybill}</Text>
        </div>
        <Button variant="outline" onClick={() => refetch()} isLoading={isFetching}>
          Refresh
        </Button>
      </div>

      {/* GIG Live Tracking */}
      <div className="mb-6 rounded-lg border p-5">
        <Text className="mb-4 text-lg font-semibold">GIG Live Data</Text>
        {!gigInfo ? (
          <Text className="text-sm text-gray-500">No live tracking data available from GIG.</Text>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Status" value={gigInfo.shipmentstatus} />
            <Field label="Is Delivered" value={gigInfo.IsDelivered ? 'Yes' : 'No'} />
            <Field label="Is Cancelled" value={gigInfo.IsCancelled ? 'Yes' : 'No'} />
            <Field label="Vehicle Type" value={gigInfo.VehicleType} />
            <Field label="Grand Total" value={gigInfo.GrandTotal ? `₦${gigInfo.GrandTotal.toLocaleString()}` : undefined} />
            <Field label="Delivery Price" value={gigInfo.DeliveryPrice ? `₦${gigInfo.DeliveryPrice.toLocaleString()}` : undefined} />
            <Field label="Sender" value={gigInfo.SenderName} />
            <Field label="Sender Phone" value={gigInfo.SenderPhoneNumber} />
            <Field label="Sender Address" value={gigInfo.SenderAddress} />
            <Field label="Receiver" value={gigInfo.ReceiverName} />
            <Field label="Receiver Phone" value={gigInfo.ReceiverPhoneNumber} />
            <Field label="Receiver Address" value={gigInfo.ReceiverAddress} />
            <Field label="Home Delivery" value={gigInfo.IsHomeDelivery ? 'Yes' : 'No'} />
            <Field label="Date Created" value={gigInfo.DateCreated ? new Date(gigInfo.DateCreated).toLocaleString() : undefined} />
            <Field label="Date Modified" value={gigInfo.DateModified ? new Date(gigInfo.DateModified).toLocaleString() : undefined} />
          </div>
        )}
        {gigInfo?.WaybillImageUrl && (
          <div className="mt-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Waybill Image</Text>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gigInfo.WaybillImageUrl}
              alt="Waybill"
              className="max-w-xs rounded border"
            />
          </div>
        )}
      </div>

      {/* Internal Shipment Record */}
      <div className="rounded-lg border p-5">
        <Text className="mb-4 text-lg font-semibold">Internal Shipment Record</Text>
        {!shipment ? (
          <Text className="text-sm text-gray-500">No internal shipment record found.</Text>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</Text>
                <Badge
                  className="mt-1"
                  color={
                    shipment.status === 'Delivered'
                      ? 'success'
                      : shipment.status === 'Failed' || shipment.status === 'Returned'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {shipment.status}
                </Badge>
              </div>
              {shipment.estimatedDelivery && (
                <Field
                  label="Estimated Delivery"
                  value={new Date(shipment.estimatedDelivery).toLocaleDateString()}
                />
              )}
              {shipment.deliveredOn && (
                <Field
                  label="Delivered On"
                  value={new Date(shipment.deliveredOn).toLocaleDateString()}
                />
              )}
            </div>

            {/* Tracking History */}
            {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
              <div className="mt-4">
                <Text className="mb-3 text-sm font-semibold">Tracking History</Text>
                <ol className="relative border-l border-gray-200">
                  {[...shipment.trackingHistory].reverse().map((entry, i) => (
                    <li key={i} className="mb-4 ml-4">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-blue-500" />
                      <Text className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Text>
                      <Text className="text-sm">{entry.description || '—'}</Text>
                      {entry.location && (
                        <Text className="text-xs text-gray-500">{entry.location}</Text>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
