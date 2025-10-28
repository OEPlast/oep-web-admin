'use client';

import { recentOrderColumns } from './recent-order-columns';
import WidgetCard from '@core/components/cards/widget-card';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import cn from '@core/utils/class-names';
import { Input, Loader } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { useOrdersTable } from '@/hooks/queries/analytics/useAnalyticsTables';
import { useState, useMemo, useEffect } from 'react';
import type { OrderTableRow } from '@/types/analytics.types';

export default function RecentOrder({ className }: { className?: string }) {
  // Default to last 30 days
  const currentDate = new Date();
  const thirtyDaysAgo = new Date(currentDate);
  thirtyDaysAgo.setDate(currentDate.getDate() - 30);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const params = useMemo(() => ({
    from: thirtyDaysAgo.toISOString().split('T')[0],
    to: currentDate.toISOString().split('T')[0],
    page,
    limit: 15,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
  }), [page]);

  const { data, isLoading, error } = useOrdersTable(params);

  const { table, setData } = useTanStackTable<OrderTableRow>({
    tableData: data?.data || [],
    columnConfig: recentOrderColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 15,
        },
      },
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r._id !== row._id));
        },
      },
      enableColumnResizing: false,
    },
  });

  // Update table data when API data changes
  useEffect(() => {
    if (data?.data) {
      setData(data.data);
    }
  }, [data, setData]);

  return (
    <WidgetCard
      title="Recent Orders"
      className={cn('p-0 lg:p-0', className)}
      headerClassName="px-5 pt-5 lg:px-7 lg:pt-7 mb-6"
      action={
        <Input
          type="search"
          clearable={true}
          inputClassName="h-[36px]"
          placeholder="Search by customer or order..."
          onClear={() => {
            setSearchTerm('');
            table.setGlobalFilter('');
          }}
          value={searchTerm}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            table.setGlobalFilter(e.target.value);
          }}
          className="w-full @3xl:order-3 @3xl:ms-auto @3xl:max-w-72"
        />
      }
    >
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader variant="spinner" size="lg" />
        </div>
      ) : error ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-red-500">Error loading orders</p>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <>
          <Table
            table={table}
            variant="modern"
            classNames={{
              cellClassName: 'first:ps-6',
              headerCellClassName: 'first:ps-6',
            }}
          />
          {data.pagination && (
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((data.pagination.currentPage - 1) * 15) + 1} to{' '}
                  {Math.min(data.pagination.currentPage * 15, data.pagination.totalRecords)} of{' '}
                  {data.pagination.totalRecords} orders
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                    disabled={page >= data.pagination.totalPages}
                    className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </WidgetCard>
  );
}
