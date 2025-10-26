'use client';

import { Order } from '@/types/order.types';
import { Text } from 'rizzui';
import { formatPrice } from '@core/hooks/use-price';

interface OrderPricingBreakdownProps {
  order: Order;
}

export default function OrderPricingBreakdown({ order }: OrderPricingBreakdownProps) {
  const format = (amount: number) => formatPrice({ amount, currencyCode: 'USD', locale: 'en-US', fractions: 2 });

  return (
    <div className="mb-6 rounded-lg border p-4">
      <Text className="mb-3 font-semibold">Pricing Breakdown</Text>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Text className="text-gray-600">Subtotal:</Text>
          <Text>{format(order.subtotal)}</Text>
        </div>
        <div className="flex justify-between">
          <Text className="text-gray-600">Shipping:</Text>
          <Text>{format(order.shippingCost)}</Text>
        </div>
        <div className="flex justify-between">
          <Text className="text-gray-600">Tax:</Text>
          <Text>{format(order.tax)}</Text>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <Text className="text-gray-600">Discount:</Text>
            <Text className="text-green-600">-{format(order.discount)}</Text>
          </div>
        )}
        <div className="border-t pt-2">
          <div className="flex justify-between">
            <Text className="font-bold">Total:</Text>
            <Text className="text-lg font-bold">{format(order.total)}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
