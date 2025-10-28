'use client';

import { routes } from '@/config/routes';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Text } from 'rizzui';
import type { OrderTableRow } from '@/types/analytics.types';
import { formatCurrency } from '@/utils/format-currency';

const columnHelper = createColumnHelper<OrderTableRow>();

export const recentOrderColumns = [
  columnHelper.display({
    id: 'id',
    size: 120,
    header: 'Order Id',
    cell: ({ row }) => <>#{row.original._id.slice(-8).toUpperCase()}</>,
  }),
  columnHelper.accessor('user', {
    id: 'customer',
    size: 300,
    header: 'Customer',
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return (
          <Text className="text-gray-500 italic">Unknown Customer</Text>
        );
      }
      return (
        <TableAvatar
          src={''} // No avatar in analytics data
          name={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
          description={user.email?.toLowerCase() || 'No email'}
        />
      );
    },
  }),
  columnHelper.display({
    id: 'items',
    size: 150,
    header: 'Items',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        {row.original.items?.length || 0}
      </Text>
    ),
  }),
  columnHelper.accessor('totalAmount', {
    id: 'totalAmount',
    size: 150,
    header: 'Amount',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        {formatCurrency(row.original.totalAmount)}
      </Text>
    ),
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 200,
    header: 'Created',
    cell: ({ row }) => <DateCell date={new Date(row.original.createdAt)} />,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 140,
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => getStatusBadge(row.original.status),
  }),
  columnHelper.display({
    id: 'action',
    size: 130,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <TableRowActionGroup
        editUrl={routes.eCommerce.editOrder(row.original._id)}
        viewUrl={routes.eCommerce.orderDetails(row.original._id)}
        deletePopoverTitle={`Delete the order`}
        deletePopoverDescription={`Are you sure you want to delete this order?`}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];
