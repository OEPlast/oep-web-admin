'use client';

import { Badge } from 'rizzui';
import { OrderStatus } from '@/types/order.types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: 'warning' | 'info' | 'secondary' | 'primary' | 'success' | 'danger' }
> = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'info' },
  processing: { label: 'Processing', color: 'secondary' },
  shipped: { label: 'Shipped', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  refunded: { label: 'Refunded', color: 'secondary' },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="flat" color={config.color} size="sm">
      {config.label}
    </Badge>
  );
}
