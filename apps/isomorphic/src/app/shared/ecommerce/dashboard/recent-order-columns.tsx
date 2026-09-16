'use client';

import { routes } from '@/config/routes';
import IdLink from '@/app/shared/id-link';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Text } from 'rizzui';
import type { OrderTableRow } from '@/types/analytics.types';
import { formatCurrency } from '@/utils/format-currency';
import cn from '@core/utils/class-names';

const columnHelper = createColumnHelper<OrderTableRow>();

export const recentOrderColumns = [
  columnHelper.display({
    id: 'id',
    size: 120,
    header: 'Order Id',
    cell: ({ row }) => (
      <IdLink
        href={routes.eCommerce.orderDetails(row.original._id)}
        title={row.original._id}
      >
        {row.original._id}
      </IdLink>
    ),
  }),
  columnHelper.accessor('user', {
    id: 'customer',
    size: 300,
    header: 'Customer',
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return <Text className="italic text-gray-500">Unknown Customer</Text>;
      }
      return (
        <figcaption className="grid gap-0.5">
          <Text
            className={
              'font-lexend text-sm font-medium text-gray-900 dark:text-gray-700'
            }
          >
            {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
          </Text>

          <Text className="text-[13px] text-gray-500">
            {user.email?.toLowerCase() || 'No email'}
          </Text>
        </figcaption>
      );
    },
  }),
  columnHelper.display({
    id: 'items',
    size: 150,
    header: 'Items',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-700">
        {row.original.products.reduce((sum, item) => sum + item.qty, 0)}
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
    header: 'Actions',
    id: 'action',
    size: 130,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <TableRowActionGroup
        viewUrl={routes.eCommerce.orderDetails(row.original._id)}
        hideDelete
      />
    ),
  }),
];
