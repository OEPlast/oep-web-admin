'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { Badge, Button, Select, Text } from 'rizzui';
import { formatNumber } from '@core/utils/format-number';
import cn from '@core/utils/class-names';
import {
  PiCaretDownBold,
  PiCaretUpBold,
  PiCaretUpDownBold,
} from 'react-icons/pi';
import type {
  TransactionsTableResponse,
  TransactionTableRow,
} from '@/types/analytics.types';
import IdLink from '@/app/shared/id-link';
import { routes } from '@/config/routes';
import { formatToNaira } from '@/libs/currencyFormatter';

interface TransactionsDataTableProps {
  // Accept backend-shaped response: { data: TransactionTableRow[], pagination }
  data?: TransactionsTableResponse;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onStatusFilter: (status?: string) => void;
  onMethodFilter: (method?: string) => void;
  selectedStatus?: string;
  selectedMethod?: string;
  isLoading?: boolean;
  limit: number;
}

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Failed', value: 'failed' },
];

const METHOD_OPTIONS = [
  { label: 'All Methods', value: '' },
  { label: 'Paystack', value: 'Paystack' },
  { label: 'Cash on Delivery', value: 'cash-on-delivery' },
];

const LIMIT_OPTIONS = [
  { label: '10 rows', value: '10' },
  { label: '20 rows', value: '20' },
  { label: '50 rows', value: '50' },
];

const getStatusBadgeColor = (
  status: string
): 'success' | 'warning' | 'danger' | 'secondary' => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default function TransactionsDataTable({
  data,
  onPageChange,
  onLimitChange,
  onStatusFilter,
  onMethodFilter,
  selectedStatus,
  selectedMethod,
  isLoading,
  limit,
}: TransactionsDataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <PiCaretUpDownBold className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <PiCaretUpBold className="h-4 w-4" />
    ) : (
      <PiCaretDownBold className="h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <WidgetCard title="Transactions Data" className="mt-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
        </div>
      </WidgetCard>
    );
  }

  // Support backend response shape (data + pagination)
  const transactions: TransactionTableRow[] = data?.data || [];
  const total = data?.pagination?.totalRecords || 0;
  const currentPage = data?.pagination?.currentPage || 1;
  const totalPages =
    data?.pagination?.totalPages || Math.ceil(total / limit || 1);

  return (
    <WidgetCard
      title="Transactions Data"
      className="mt-6"
      headerClassName="items-center"
      action={
        <div className="flex gap-3">
          <Select
            value={selectedStatus ?? 'All Status'}
            options={STATUS_OPTIONS}
            onChange={(value: { value: string }) =>
              onStatusFilter(value.value || undefined)
            }
            className="w-40"
            placeholder="Filter by status"
          />
          <Select
            value={selectedMethod ?? 'All Methods'}
            options={METHOD_OPTIONS}
            onChange={(value: { value: string }) =>
              onMethodFilter(value.value || undefined)
            }
            className="w-48"
            placeholder="Filter by method"
          />
          <Select
            value={limit.toString()}
            options={LIMIT_OPTIONS}
            onChange={(value: { value: number }) =>
              onLimitChange(Number(value.value))
            }
            className="w-32"
          />
        </div>
      }
    >
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Transaction ID
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Customer
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center justify-end gap-1 font-semibold text-gray-700 hover:text-gray-900"
                >
                  Amount {getSortIcon('amount')}
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="font-semibold text-gray-700">
                  Payment Method
                </span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="font-semibold text-gray-700">Status</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Date
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Text className="text-gray-500">No transactions found</Text>
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => (
                <tr
                  key={transaction._id}
                  className={cn(
                    'border-b border-gray-100 transition-colors hover:bg-gray-50',
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  )}
                >
                  <td className="px-4 py-3">
                    <IdLink
                      href={routes.transactions.details(transaction._id)}
                      title={transaction._id}
                      className="text-gray-900"
                    >
                      {transaction._id}
                    </IdLink>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <Text className="font-medium text-gray-900">
                        {transaction.userId?.firstName}{' '}
                        {transaction.userId?.lastName}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {transaction.userId?.email}
                      </Text>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Text className="font-semibold text-gray-900">
                      {formatToNaira(transaction.amount)}
                    </Text>
                  </td>
                  <td className="px-4 py-3">
                    <Text className="text-sm capitalize text-gray-700">
                      {(transaction.paymentMethod || '').replace('-', ' ')}
                    </Text>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      color={getStatusBadgeColor(transaction.status)}
                      className="capitalize"
                    >
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Text className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </Text>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <Text className="text-sm text-gray-600">
            Showing {(currentPage - 1) * limit + 1} to{' '}
            {Math.min(currentPage * limit, total)} of {total} transactions
          </Text>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? 'solid' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
