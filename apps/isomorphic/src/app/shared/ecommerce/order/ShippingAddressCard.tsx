'use client';

import { ShippingAddress } from '@/types/order.types';
import { Text } from 'rizzui';

interface ShippingAddressCardProps {
  address: ShippingAddress;
}

export default function ShippingAddressCard({ address }: ShippingAddressCardProps) {
  return (
    <div className="mb-6 rounded-lg border p-4">
      <Text className="mb-3 font-semibold">Shipping Address</Text>
      <div className="space-y-1">
        <Text className="font-medium">{address.fullName}</Text>
        <Text className="text-gray-600">{address.phone}</Text>
        <Text className="text-gray-600">{address.addressLine1}</Text>
        {address.addressLine2 && (
          <Text className="text-gray-600">{address.addressLine2}</Text>
        )}
        <Text className="text-gray-600">
          {address.city}, {address.state} {address.zipCode}
        </Text>
        <Text className="text-gray-600">{address.country}</Text>
      </div>
    </div>
  );
}
