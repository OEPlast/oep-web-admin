'use client';

import { Badge } from 'rizzui';
import { PaymentStatus } from '@/types/order.types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; color: 'warning' | 'success' | 'danger' | 'secondary' }
> = {
  pending: { label: 'Pending', color: 'warning' },
  paid: { label: 'Paid', color: 'success' },
  completed: { label: 'Completed', color: 'success' },
  failed: { label: 'Failed', color: 'danger' },
  refunded: { label: 'Refunded', color: 'secondary' },
  partially_refunded: { label: 'Partial Refund', color: 'warning' },
};

export default function PaymentStatusBadge({
  status,
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="flat" color={config.color} size="sm">
      {config.label}
    </Badge>
  );
}
