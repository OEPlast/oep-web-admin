'use client';

import { Transaction, TransactionStatus } from '@/types/transaction.types';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Button, Checkbox, ActionIcon, Tooltip } from 'rizzui';
import { PiEyeBold, PiCopyBold } from 'react-icons/pi';
import { formatDate } from '@core/utils/format-date';
import toast from 'react-hot-toast';
import Link from 'next/link';
import IdLink from '@/app/shared/id-link';
import { routes } from '@/config/routes';

const columnHelper = createColumnHelper<Transaction>();

// Status badge color mapping
const statusColorMap: Record<
  TransactionStatus,
  'warning' | 'success' | 'danger' | 'secondary' | 'info'
> = {
  pending: 'warning',
  completed: 'success',
  failed: 'danger',
  cancelled: 'secondary',
  refunded: 'info',
  partially_refunded: 'info',
};

// Payment method badge colors
const methodColorMap: Record<
  string,
  'info' | 'success' | 'warning' | 'secondary'
> = {
  stripe: 'info',
  paystack: 'success',
  flutterwave: 'warning',
  bank_transfer: 'success',
  cash_on_delivery: 'secondary',
};

// Gateway badge colors
const gatewayColorMap: Record<
  string,
  'info' | 'success' | 'warning' | 'secondary'
> = {
  paystack: 'success',
  stripe: 'info',
  flutterwave: 'warning',
  manual: 'secondary',
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Copy to clipboard helper
const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch (error) {
    toast.error('Failed to copy to clipboard');
  }
};

export const transactionsColumns = (
  onViewTransaction: (transaction: Transaction) => void
) => [
  columnHelper.accessor('reference', {
    id: 'reference',
    size: 200,
    header: 'Reference',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IdLink
          href={routes.transactions.details(row.original._id)}
          title={row.original.reference}
          className="text-sm"
        >
          {row.original.reference}
        </IdLink>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'customer',
    size: 220,
    header: 'Customer',
    cell: ({ row }) => {
      const user = row.original.user;
      if (typeof user === 'object' && user !== null) {
        return (
          <Link
            href={routes.users.details(user._id)}
            className="group flex flex-col"
          >
            <span className="text-sm font-medium group-hover:underline">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </Link>
        );
      }
      return <span className="text-xs text-gray-400">N/A</span>;
    },
  }),
  columnHelper.display({
    id: 'orderId',
    size: 200,
    header: 'Order ID',
    cell: ({ row }) => {
      const order = row.original.order;
      if (typeof order === 'object' && order !== null) {
        return (
          <IdLink
            href={routes.eCommerce.orderDetails(order._id)}
            title={order._id}
            className="font-mono text-sm"
          >
            {order._id}
          </IdLink>
        );
      }
      return <span className="text-xs text-gray-400">N/A</span>;
    },
  }),
  columnHelper.display({
    id: 'returnId',
    size: 220,
    header: 'Return ID',
    cell: ({ row }) => {
      const refunds = row.original.refunds || [];
      if (refunds.length > 0 && refunds[0]?.refundId) {
        const rid = refunds[0].refundId;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{rid}</span>
            <Tooltip content="Copy return ID">
              <ActionIcon
                variant="text"
                size="sm"
                onClick={() => copyToClipboard(rid, 'Return ID')}
              >
                <PiCopyBold className="h-3.5 w-3.5" />
              </ActionIcon>
            </Tooltip>
            {refunds.length > 1 && (
              <span className="text-[11px] text-gray-500">
                +{refunds.length - 1} more
              </span>
            )}
          </div>
        );
      }
      return <span className="text-xs text-gray-400">N/A</span>;
    },
  }),
  columnHelper.accessor('amount', {
    id: 'amount',
    size: 140,
    header: 'Amount',
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  }),
  columnHelper.accessor('paymentMethod', {
    id: 'paymentMethod',
    size: 140,
    header: 'Payment',
    cell: ({ row }) => (
      <Badge
        variant="flat"
        color={methodColorMap[row.original.paymentMethod] || 'secondary'}
        className="capitalize"
      >
        {row.original.paymentMethod.replace('_', ' ')}
      </Badge>
    ),
  }),
  columnHelper.accessor('paymentGateway', {
    id: 'paymentGateway',
    size: 130,
    header: 'Gateway',
    cell: ({ row }) => (
      <Badge
        variant="flat"
        color={gatewayColorMap[row.original.paymentGateway] || 'secondary'}
        className="capitalize"
      >
        {row.original.paymentGateway}
      </Badge>
    ),
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 140,
    header: 'Status',
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <Badge
          variant="flat"
          color={statusColorMap[row.original.status] || 'secondary'}
          className="capitalize"
        >
          {row.original.status.replace('_', ' ')}
        </Badge>
        {row.original.review?.required && (
          <Tooltip content={row.original.review.reason || 'Flagged for review'}>
            <Badge variant="flat" color="danger" size="sm">
              Needs review
            </Badge>
          </Tooltip>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 160,
    header: 'Date',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">
          {formatDate(new Date(row.original.createdAt), 'MMM DD, YYYY')}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(new Date(row.original.createdAt), 'hh:mm A')}
        </span>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    size: 120,
    header: 'Actions',
    cell: ({ row }) => (
      <Link href={routes.transactions.details(row.original._id)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewTransaction(row.original)}
        >
          <PiEyeBold className="mr-1.5 h-4 w-4" />
          View
        </Button>
      </Link>
    ),
  }),
];
