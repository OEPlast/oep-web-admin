'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Text } from 'rizzui';
import { routes } from '@/config/routes';

export default function DeliveryInfoIndexClient() {
  const [waybill, setWaybill] = useState('');
  const router = useRouter();

  const handleLookup = () => {
    const trimmed = waybill.trim();
    if (!trimmed) return;
    router.push(routes.eCommerce.gigLogistics.deliveryInfo(trimmed));
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Text className="mb-2 text-2xl font-bold">Delivery Info Lookup</Text>
        <Text className="mb-6 text-sm text-gray-500">
          Enter a GIG waybill number to view full shipment details.
        </Text>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 1349107274"
            value={waybill}
            onChange={(e) => setWaybill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="flex-1"
          />
          <Button onClick={handleLookup} disabled={!waybill.trim()}>
            Look up
          </Button>
        </div>
        <Button
          variant="text"
          className="mt-4 text-sm"
          onClick={() => router.push(routes.eCommerce.gigLogistics.deliveryTracking)}
        >
          ← View all GIG deliveries
        </Button>
      </div>
    </div>
  );
}
