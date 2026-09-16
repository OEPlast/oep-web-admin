"use client";

import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { ActionIcon, Badge, Flex, Text, Tooltip } from 'rizzui';
import { PiEyeDuotone, PiPencilDuotone } from 'react-icons/pi';
import { STATUS_BADGE_CONFIG, type Shipment, type ShipmentStatus  } from '@/types/shipment.types';
import { routes } from '@/config/routes';
import IdLink from '@/app/shared/id-link';

const columnHelper = createColumnHelper<Shipment>();

 const DeliveriesColumns = [
  columnHelper.display({
    id: 'trackingNumber',
    header: 'Tracking Number',
    cell: ({ row }) => (
      <IdLink
        href={routes.eCommerce.delivery.details(row.original._id)}
        title={row.original.trackingNumber}
        className="text-gray-900"
      >
        {row.original.trackingNumber}
      </IdLink>
    ),
    size: 220,
  }),
  columnHelper.display({
    id: 'orderId',
    header: 'Order',
    cell: ({ row }) => {
      const order = row.original.orderId as any;
      const orderId = typeof order === 'string' ? order : order?.orderNumber || order?._id;
      const orderRecordId = typeof order === 'string' ? order : order?._id;
      return (
        <IdLink
          href={orderRecordId ? routes.eCommerce.orderDetails(orderRecordId) : null}
          title={orderId}
          className="text-gray-700"
        >
          {orderId?.slice(0, 8)}...
        </IdLink>
      );
    },
    size: 140,
  }),
  columnHelper.accessor('courier', {
    id: 'courier',
    header: 'Courier',
    cell: ({ row }) => <Text className="text-gray-700">{row.original.courier}</Text>,
    size: 160,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => {
      const status = row.original.status as ShipmentStatus;
      const cfg = STATUS_BADGE_CONFIG[status];
      return (
        <Badge variant={cfg.variant as any} color={cfg.color as any}>
          {cfg.label}
        </Badge>
      );
    },
    size: 150,
  }),
  columnHelper.display({
    id: 'estimatedDelivery',
    header: 'ETA',
    cell: ({ row }) => {
      const date = row.original.estimatedDelivery;
      return date ? (
        <Text className="text-gray-700">{new Date(date).toLocaleDateString()}</Text>
      ) : (
        <Text className="text-gray-400">N/A</Text>
      );
    },
    size: 140,
  }),
  columnHelper.display({
    id: 'action',
    header: 'Actions',
    size: 140,
    cell: ({ row }) => {
      return (
        <Flex align="center" justify="end" gap="3" className="pe-4">
          <Tooltip size="sm" content="View" placement="top" color="invert">
            <Link href={routes.eCommerce.delivery.details(row.original._id)}>
              <ActionIcon as="span" size="sm" variant="outline" aria-label="View Delivery">
                <PiEyeDuotone className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
          <Tooltip size="sm" content="Edit" placement="top" color="invert">
            <Link href={routes.eCommerce.delivery.edit(row.original._id)}>
              <ActionIcon as="span" size="sm" variant="outline" aria-label="Edit Delivery">
                <PiPencilDuotone className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
        </Flex>
      );
    },
  }),
];
export default  DeliveriesColumns;
