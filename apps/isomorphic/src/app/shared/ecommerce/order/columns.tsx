'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Order } from '@/types/order.types';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { ActionIcon, Text } from 'rizzui';
import { PiEyeBold } from 'react-icons/pi';
import { formatPrice } from '@core/hooks/use-price';
import { getCdnUrl } from '@core/utils/cdn-url';

const columnHelper = createColumnHelper<Order>();

export const ordersColumns = (onViewOrder: (order: Order) => void) => [
  columnHelper.display({
    id: 'orderNumber',
    size: 140,
    header: 'Order #',
    cell: ({ row }) => (
      <Text className="font-medium">#{row.original.orderNumber}</Text>
    ),
  }),

  columnHelper.accessor('user', {
    id: 'customer',
    size: 250,
    header: 'Customer',
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <TableAvatar
          src={getCdnUrl(user.avatar) || ''}
          name={`${user.firstName} ${user.lastName}`}
          description={user.email}
        />
      );
    },
  }),

  columnHelper.accessor('items', {
    id: 'items',
    size: 100,
    header: 'Items',
    cell: ({ row }) => <Text>{row.original.items.length} item(s)</Text>,
  }),

  columnHelper.accessor('total', {
    id: 'total',
    size: 120,
    header: 'Total',
    cell: ({ row }) => (
      <Text className="font-semibold">
        {formatPrice({
          amount: row.original.total,
          currencyCode: 'USD',
          locale: 'en-US',
          fractions: 2,
        })}
      </Text>
    ),
  }),

  columnHelper.accessor('paymentStatus', {
    id: 'paymentStatus',
    size: 140,
    header: 'Payment',
    cell: ({ row }) => <PaymentStatusBadge status={row.original.paymentStatus} />,
  }),

  columnHelper.accessor('status', {
    id: 'status',
    size: 140,
    header: 'Status',
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  }),

  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 180,
    header: 'Order Date',
    cell: ({ row }) => <DateCell date={new Date(row.original.createdAt)} />,
  }),

  columnHelper.display({
    id: 'actions',
    size: 80,
    header: 'Actions',
    cell: ({ row }) => (
      <ActionIcon
        size="sm"
        variant="outline"
        onClick={() => onViewOrder(row.original)}
      >
        <PiEyeBold className="h-4 w-4" />
      </ActionIcon>
    ),
  }),
];
