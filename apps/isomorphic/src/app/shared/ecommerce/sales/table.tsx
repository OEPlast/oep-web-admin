'use client';

import { useState, useEffect, useMemo } from 'react';
import { salesColumns } from '@/app/shared/ecommerce/sales/columns';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { useSales } from '@/hooks/queries/useSales';
import { Sale, SalesFilters } from '@/types/sales';
import { Loader, Text, Button } from 'rizzui';
import { PiArrowsClockwise } from 'react-icons/pi';

export type SalesDataType = Sale;

export default function SalesTable() {
  const [filters, setFilters] = useState<SalesFilters>({
    page: 1,
    limit: 10,
  });

  const { data: salesData, isLoading, error, refetch } = useSales(filters);

  const { table, setData } = useTanStackTable<SalesDataType>({
    tableData: [],
    columnConfig: salesColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: filters.page ? filters.page - 1 : 1,
          pageSize: filters.limit || 15,
        },
      },
      manualPagination: true,
      pageCount: salesData?.pagination?.pages,
      enableColumnResizing: false,
    },
  });

  // Update table data when sales data changes
  useEffect(() => {
    if (salesData?.sales) {
      setData(salesData.sales);
    }
  }, [salesData, setData]);

  const paginationState = useMemo(
    () => table.getState().pagination,
    [table.getState().pagination]
  );
  useEffect(() => {
    const newPage = paginationState.pageIndex + 1;
    console.log(newPage);
    if (salesData?.pagination && newPage !== salesData.pagination.page) {
      console.log(newPage);

      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  }, [paginationState.pageIndex, salesData?.pagination, setFilters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SalesFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-muted bg-white">
        <Filters
          table={table}
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={() => refetch()}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader variant="spinner" size="xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-muted bg-white">
        <Filters
          table={table}
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={() => refetch()}
        />
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
          <Text className="text-center text-red-600">
            Error loading sales: {error.message}
          </Text>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <PiArrowsClockwise className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Filters
        table={table}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={() => refetch()}
      />
      <Table
        table={table}
        variant="modern"
        classNames={{
          bodyClassName: 'border border-muted',
          container: 'border border-muted',
          rowClassName: 'last:border-0',
        }}
      />
      <TableFooter table={table} />
      <TablePagination table={table} className="py-4" />
    </div>
  );
}
