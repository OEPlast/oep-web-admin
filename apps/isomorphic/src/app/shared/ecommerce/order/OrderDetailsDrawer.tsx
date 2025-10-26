'use client';

import { Order } from '@/types/order.types';
import { Drawer, Text, Button } from 'rizzui';
import OrderItemsList from './OrderItemsList';
import OrderPricingBreakdown from './OrderPricingBreakdown';
import ShippingAddressCard from './ShippingAddressCard';
import OrderTimeline from './OrderTimeline';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';

interface OrderDetailsDrawerProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
}: OrderDetailsDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div>
            <Text className="text-2xl font-bold">Order #{order.orderNumber}</Text>
            <Text className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </div>
          <div className="flex gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-6 rounded-lg border p-4">
          <Text className="mb-2 font-semibold">Customer Information</Text>
          <Text className="font-medium">
            {order.user.firstName} {order.user.lastName}
          </Text>
          <Text className="text-sm text-gray-600">{order.user.email}</Text>
        </div>

        {/* Order Items */}
        <OrderItemsList items={order.items} />

        {/* Pricing */}
        <OrderPricingBreakdown order={order} />

        {/* Shipping Address */}
        <ShippingAddressCard address={order.shippingAddress} />

        {/* Payment & Shipping Info */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <Text className="mb-2 font-semibold">Payment Method</Text>
            <Text className="capitalize">{order.paymentMethod.replace('_', ' ')}</Text>
            {order.paymentDetails.transactionId && (
              <Text className="text-sm text-gray-600">
                ID: {order.paymentDetails.transactionId}
              </Text>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <Text className="mb-2 font-semibold">Shipping Method</Text>
            <Text className="capitalize">{order.shippingMethod}</Text>
            {order.trackingNumber && (
              <>
                <Text className="text-sm text-gray-600">
                  Tracking: {order.trackingNumber}
                </Text>
                {order.carrier && (
                  <Text className="text-sm text-gray-600">
                    Carrier: {order.carrier}
                  </Text>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {(order.notes || order.internalNotes) && (
          <div className="mb-6 rounded-lg border p-4">
            <Text className="mb-2 font-semibold">Notes</Text>
            {order.notes && (
              <div className="mb-2">
                <Text className="text-sm font-medium">Customer Notes:</Text>
                <Text className="text-sm text-gray-600">{order.notes}</Text>
              </div>
            )}
            {order.internalNotes && (
              <div>
                <Text className="text-sm font-medium">Internal Notes:</Text>
                <Text className="text-sm text-gray-600">{order.internalNotes}</Text>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <OrderTimeline statusHistory={order.statusHistory} />

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
