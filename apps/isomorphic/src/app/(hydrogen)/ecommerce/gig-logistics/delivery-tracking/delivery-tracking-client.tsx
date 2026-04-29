'use client';

import { useState } from 'react';
import { Badge, Button, Input, Loader, Text } from 'rizzui';
import { apiClient, handleApiError } from '@/libs/axios';
import api from '@/libs/endpoints';
import type { GIGPreshipmentDetail } from '@/hooks/queries/useGIGConfig';

function Field({ label, value }: { label: string; value: string | number | boolean | undefined | null }) {
  return (
    <div>
      <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</Text>
      <Text className="mt-0.5 text-sm text-gray-900">{value != null && value !== '' ? String(value) : '—'}</Text>
    </div>
  );
}

export default function DeliveryTrackingClient() {
  const [waybill, setWaybill] = useState('');
  const [result, setResult] = useState<GIGPreshipmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    const trimmed = waybill.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiClient.get<GIGPreshipmentDetail[]>(api.gig.track(trimmed));
      const data = response.data;
      if (!data || data.length === 0) {
        setError('No tracking data found for this waybill.');
      } else {
        setResult(data[0]);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Text className="text-2xl font-bold">GIG Delivery Tracking</Text>
        <Text className="text-sm text-gray-500">
          Enter a GIG waybill number to fetch live tracking info.
        </Text>
      </div>

      <div className="mb-6 flex gap-2">
        <Input
          placeholder="e.g. 1349107274"
          value={waybill}
          onChange={(e) => setWaybill(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          className="flex-1"
        />
        <Button onClick={handleTrack} isLoading={isLoading} disabled={!waybill.trim()}>
          Track
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Loader size="xl" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-700">{error}</Text>
        </div>
      )}

      {result && (
        <div className="rounded-lg border p-5">
          <div className="mb-4 flex items-center justify-between">
            <Text className="text-lg font-semibold">Tracking Result</Text>
            <Badge
              color={
                result.IsDelivered
                  ? 'success'
                  : result.IsCancelled
                    ? 'danger'
                    : 'info'
              }
            >
              {result.shipmentstatus || 'Unknown'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Waybill" value={result.Waybill} />
            <Field label="Is Delivered" value={result.IsDelivered ? 'Yes' : 'No'} />
            <Field label="Is Cancelled" value={result.IsCancelled ? 'Yes' : 'No'} />
            <Field label="Home Delivery" value={result.IsHomeDelivery ? 'Yes' : 'No'} />
            <Field label="Vehicle Type" value={result.VehicleType} />
            <Field
              label="Grand Total"
              value={result.GrandTotal ? `₦${result.GrandTotal.toLocaleString()}` : undefined}
            />
            <Field
              label="Delivery Price"
              value={result.DeliveryPrice ? `₦${result.DeliveryPrice.toLocaleString()}` : undefined}
            />
            <Field label="Sender" value={result.SenderName} />
            <Field label="Sender Phone" value={result.SenderPhoneNumber} />
            <Field label="Sender Address" value={result.SenderAddress} />
            <Field label="Receiver" value={result.ReceiverName} />
            <Field label="Receiver Phone" value={result.ReceiverPhoneNumber} />
            <Field label="Receiver Address" value={result.ReceiverAddress} />
            <Field
              label="Date Created"
              value={result.DateCreated ? new Date(result.DateCreated).toLocaleString() : undefined}
            />
            <Field
              label="Date Modified"
              value={result.DateModified ? new Date(result.DateModified).toLocaleString() : undefined}
            />
          </div>

          {result.WaybillImageUrl && (
            <div className="mt-4">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Waybill Image
              </Text>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.WaybillImageUrl}
                alt="Waybill"
                className="max-w-xs rounded border"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
