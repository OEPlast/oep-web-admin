'use client';

import {
  Order,
  OrdersListResponse,
  OrdersQueryParams,
} from '@/types/order.types';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { ordersColumns } from './columns';
import { useEffect, useRef } from 'react';

/**
 * Module-level so the identity is stable. Written inline as a default prop value, it was a new
 * object on every render while the orders query was loading, which made the "sync rows" effect
 * below fire on every render — React then stopped the page with "Maximum update depth exceeded".
 */
const NO_ORDERS: OrdersListResponse = {
  orders: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
};

interface OrdersTableProps {
  orders?: OrdersListResponse;
  queryParams: OrdersQueryParams;
  onViewOrder: (order: Order) => void;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function OrdersTable({
  orders = NO_ORDERS,
  onViewOrder,
  isLoading = false,
  queryParams,
  onPageChange,
  onPageSizeChange,
}: OrdersTableProps) {
  const mainOrders = orders.orders;
  const currentPage = queryParams.page ?? orders.pagination.page;
  const currentLimit = queryParams.limit ?? orders.pagination.limit;

  const { table, setData } = useTanStackTable<Order>({
    tableData: mainOrders,
    columnConfig: ordersColumns(onViewOrder),
    options: {
      initialState: {
        pagination: {
          pageIndex: currentPage - 1,
          pageSize: currentLimit,
        },
      },
      pageCount: orders.pagination.pages,
      manualPagination: true,
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    setData(mainOrders);
  }, [mainOrders, setData]);

  /**
   * Pagination is held by the table, but the query that fetches the rows is held by the page.
   * Whichever one moved is the one to follow: a click on the pager tells the page to refetch, and
   * a page-driven change (filters reset to page 1, for example) moves the table. Tracking what was
   * last reported is what stops the two from pushing each other back and forth.
   */
  const { pageIndex, pageSize } = table.getState().pagination;
  const reported = useRef({ page: currentPage, limit: currentLimit });

  useEffect(() => {
    const tablePage = pageIndex + 1;

    if (tablePage !== reported.current.page) {
      reported.current.page = tablePage;
      if (tablePage !== currentPage) onPageChange?.(tablePage);
      return;
    }

    if (currentPage !== tablePage) {
      reported.current.page = currentPage;
      table.setPageIndex(currentPage - 1);
    }
  }, [pageIndex, currentPage, onPageChange, table]);

  useEffect(() => {
    if (pageSize !== reported.current.limit) {
      reported.current.limit = pageSize;
      // Rows-per-page used to change nothing: the table pages on the server, and this never
      // reached the query.
      if (pageSize !== currentLimit) onPageSizeChange?.(pageSize);
      return;
    }

    if (currentLimit !== pageSize) {
      reported.current.limit = currentLimit;
      table.setPageSize(currentLimit);
    }
  }, [pageSize, currentLimit, onPageSizeChange, table]);

  return (
    <div>
      <Table
        isLoading={isLoading}
        table={table}
        variant="modern"
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      <TablePagination table={table} className="py-4" />
    </div>
  );
}
