'use client';

import { useMemo, useEffect } from 'react';
import { Return } from '@/hooks/queries/useReturns';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { Badge, Text, Tooltip, ActionIcon } from 'rizzui';
import { PiEyeBold } from 'react-icons/pi';
import { ColumnDef } from '@tanstack/react-table';
import IdLink from '@/app/shared/id-link';
import { routes } from '@/config/routes';

interface ReturnsTableProps {
  returns: Return[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onViewReturn: (returnId: string) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

// Status badge color mapping
const getStatusColor = (status: string) => {
  const colors: Record<string, 'warning' | 'success' | 'danger' | 'info' | 'secondary'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    items_received: 'info',
    inspecting: 'info',
    inspection_passed: 'success',
    inspection_failed: 'danger',
    completed: 'success',
    cancelled: 'secondary',
  };
  return colors[status] || 'secondary';
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format relative time
const formatRelativeTime = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function ReturnsTable({
  returns,
  meta,
  onViewReturn,
  onPageChange,
  isLoading = false,
}: ReturnsTableProps) {
  const columns = useMemo<ColumnDef<Return>[]>(
    () => [
      {
        header: 'Return Number',
        accessorKey: 'returnNumber',
        cell: ({ row }) => (
          <IdLink
            href={routes.eCommerce.returnDetails(row.original._id)}
            title={row.original.returnNumber}
          >
            {row.original.returnNumber}
          </IdLink>
        ),
      },
      {
        header: 'Order',
        accessorKey: 'order',
        cell: ({ row }) => {
          const order = row.original.order;
          return (
            <div>
              <IdLink
                href={order?._id ? routes.eCommerce.orderDetails(order._id) : null}
                title={order?._id}
                className="text-sm"
              >
                {order?.orderNumber ?? `#${order?._id?.slice(-6) ?? '—'}`}
              </IdLink>
              <Text className="text-xs text-gray-500">
                {formatCurrency(order?.total ?? 0)}
              </Text>
            </div>
          );
        },
      },
      {
        header: 'Customer',
        accessorKey: 'user',
        cell: ({ row }) => (
          <div>
            <Text className="text-sm font-medium">
              {row.original.user?.firstName} {row.original.user?.lastName}
            </Text>
            <Text className="text-xs text-gray-500">
              {row.original.user?.email}
            </Text>
          </div>
        ),
      },
      {
        header: 'Items',
        accessorKey: 'items',
        cell: ({ row }) => (
          <Text className="text-sm">
            {row.original.items.length} {row.original.items.length === 1 ? 'item' : 'items'}
          </Text>
        ),
      },
      {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ row }) => (
          <Badge variant="flat" color={row.original.type === 'refund' ? 'info' : 'warning'}>
            {row.original.type}
          </Badge>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Badge variant="flat" color={getStatusColor(row.original.status)}>
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        header: 'Requested',
        accessorKey: 'requestedAt',
        cell: ({ row }) => (
          <Tooltip content={new Date(row.original.requestedAt).toLocaleString()}>
            <Text className="text-sm text-gray-600">
              {formatRelativeTime(row.original.requestedAt)}
            </Text>
          </Tooltip>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Tooltip content="View Details">
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={() => onViewReturn(row.original._id)}
              >
                <PiEyeBold className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
          </div>
        ),
      },
    ],
    [onViewReturn]
  );

  const { table, setData } = useTanStackTable<Return>({
    tableData: returns,
    columnConfig: columns,
    options: {
      initialState: {
        pagination: {
          pageIndex: (meta?.page || 1) - 1,
          pageSize: meta?.limit || 10,
        },
      },
      manualPagination: true,
      pageCount: meta?.pages || 1,
      enableColumnResizing: false,
    },
  });

  // Keep table data in sync when the incoming `returns` prop changes
  useEffect(() => {
    setData(returns || []);
  }, [returns, setData]);

  // Handle pagination changes via table state
  const currentPageIndex = table.getState().pagination.pageIndex;
  useEffect(() => {
    const newPage = currentPageIndex + 1;
    if (meta && newPage !== meta.page) {
      onPageChange(newPage);
    }
  }, [currentPageIndex, meta, onPageChange]);

  return (
    <div>
      <Table
        table={table}
        variant="modern"
        isLoading={isLoading}
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      {meta && meta.total > 0 && (
        <TablePagination
          table={table}
          className="py-4"
        />
      )}
    </div>
  );
}
