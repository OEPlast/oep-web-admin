'use client';

import { OrderItem } from '@/types/order.types';
import { Text } from 'rizzui';
import Image from 'next/image';
import { getCdnUrl } from '@core/utils/cdn-url';
import { formatPrice } from '@core/hooks/use-price';

interface OrderItemsListProps {
  items: OrderItem[];
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="mb-6">
      <Text className="mb-3 font-semibold">Order Items</Text>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Image
              src={
                getCdnUrl(item.product.coverImage || item.product.image) ||
                '/placeholder.png'
              }
              alt={item.product.name}
              width={60}
              height={60}
              className="h-15 w-15 rounded-md object-cover"
            />
            <div className="flex-1">
              <Text className="font-medium">{item.product.name}</Text>
              {item.variant && (
                <Text className="text-sm text-gray-600">
                  {item.variant.size && `Size: ${item.variant.size}`}
                  {item.variant.size && item.variant.color && ' | '}
                  {item.variant.color && `Color: ${item.variant.color}`}
                </Text>
              )}
              <Text className="text-sm text-gray-600">
                Quantity: {item.quantity} × {formatPrice({ amount: item.price, currencyCode: 'USD', locale: 'en-US', fractions: 2 })}
              </Text>
            </div>
            <div className="text-right">
              <Text className="font-semibold">
                {formatPrice({ amount: item.subtotal, currencyCode: 'USD', locale: 'en-US', fractions: 2 })}
              </Text>
              {item.discount > 0 && (
                <Text className="text-sm text-green-600">
                  -{formatPrice({ amount: item.discount, currencyCode: 'USD', locale: 'en-US', fractions: 2 })} off
                </Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
