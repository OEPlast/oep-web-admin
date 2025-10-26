'use client';

import { useState, useEffect, useMemo } from 'react';
import { couponsColumns } from '@/app/shared/ecommerce/coupon/columns';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { CouponDataType } from '@/data/coupon-data';
import { useCoupons } from '@/hooks/queries/useCoupons';
import { useDeleteCoupon } from '@/hooks/mutations/useCouponMutations';
import { Loader, Text } from 'rizzui';

export type CouponsDataType = CouponDataType;

export default function CouponsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(
    undefined
  );

  const {
    data: couponsData,
    isLoading,
    error,
  } = useCoupons({
    page,
    limit,
    search,
    active: activeFilter,
  });

  const deleteMutation = useDeleteCoupon();

  // Ensure we always have an array for tableData
  // Memoize table items to get stable reference based on actual data
  const tableItems = useMemo(() => {
    return Array.isArray(couponsData?.items) ? couponsData.items : [];
  }, [couponsData]);
  const { table, setData } = useTanStackTable<CouponsDataType>({
    tableData: tableItems,
    columnConfig: couponsColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: page - 1,
          pageSize: limit,
        },
      },
      manualPagination: true,
      pageCount: couponsData?.totalPages || 1,
      meta: {
        handleDeleteRow: (row: CouponsDataType) => {
          deleteMutation.mutate(row._id);
        },
        handleMultipleDelete: (rows: CouponsDataType[]) => {
          rows.forEach((row: CouponsDataType) => {
            deleteMutation.mutate(row._id);
          });
        },
      },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    if (couponsData?.items) {
      setData(couponsData.items);
    }
  }, [couponsData?.items]);

  // Update table page when pagination state changes
  useEffect(() => {
    const paginationState = table.getState().pagination;
    if (paginationState.pageIndex !== page - 1) {
      setPage(paginationState.pageIndex + 1);
    }
    if (paginationState.pageSize !== limit) {
      setLimit(paginationState.pageSize);
    }
  }, [
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Text className="text-red-500">
          Error loading coupons: {error.message}
        </Text>
      </div>
    );
  }

  if (!couponsData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Text>No data available</Text>
      </div>
    );
  }

  return (
    <>
      <Filters
        table={table}
        search={search}
        onSearchChange={setSearch}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
      />
      <Table
        table={table}
        variant="modern"
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      <TableFooter table={table} />
      <TablePagination table={table} className="py-4" />
    </>
  );
}
