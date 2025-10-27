'use client';

import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { ActionIcon, Badge, Flex, Text, Tooltip } from 'rizzui';
import { PiEyeDuotone, PiPencilDuotone } from 'react-icons/pi';
import type { Shipment, ShipmentStatus } from '@/types/shipment.types';
import { STATUS_BADGE_CONFIG } from '@/types/shipment.types';

const columnHelper = createColumnHelper<Shipment>();

export const shipmentsListColumns = [
  columnHelper.display({
    id: 'trackingNumber',
    header: 'Tracking Number',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-900">{row.original.trackingNumber}</Text>
    ),
    size: 220,
  }),
  columnHelper.display({
    id: 'orderId',
    header: 'Order',
    cell: ({ row }) => {
      const order = row.original.orderId as any;
      const orderId = typeof order === 'string' ? order : order?.orderNumber || order?._id;
      return <Text className="text-gray-700">{orderId?.slice(0, 8)}...</Text>;
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
    header: 'Estimated Delivery',
    cell: ({ row }) => {
      const date = row.original.estimatedDelivery;
      return date ? (
        <Text className="text-gray-700">{new Date(date).toLocaleDateString()}</Text>
      ) : (
        <Text className="text-gray-400">N/A</Text>
      );
    },
    size: 180,
  }),
  columnHelper.accessor('cost', {
    id: 'cost',
    header: 'Cost',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-900">₦{Number(row.original.cost).toFixed(2)}</Text>
    ),
    size: 120,
  }),
  columnHelper.display({
    id: 'action',
    size: 160,
    cell: ({ row, table: { options: { meta } } }) => (
      <Flex align="center" justify="end" gap="3" className="pe-4">
        <Tooltip size="sm" content="View" placement="top" color="invert">
          <Link href={routes.eCommerce.shipment.shipmentDetails(row.original._id)}>
            <ActionIcon as="span" size="sm" variant="outline" aria-label="View Shipment">
              <PiEyeDuotone className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <Tooltip size="sm" content="Edit" placement="top" color="invert">
          <Link href={routes.eCommerce.shipment.editShipment(row.original._id)}>
            <ActionIcon as="span" size="sm" variant="outline" aria-label="Edit Shipment">
              <PiPencilDuotone className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <DeletePopover
          title="Delete Shipment"
          description={`Are you sure you want to delete tracking #${row.original.trackingNumber}?`}
          onDelete={() => meta?.handleDeleteRow && (meta as any).handleDeleteRow(row.original)}
        />
      </Flex>
    ),
  }),
];
