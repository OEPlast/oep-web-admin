'use client';

import { Order } from '@/types/order.types';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { ordersColumns } from './columns';
import { useEffect } from 'react';

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  isLoading?: boolean;
}

export default function OrdersTable({
  orders,
  onViewOrder,
  isLoading = false,
}: OrdersTableProps) {
  const { table, setData } = useTanStackTable<Order>({
    tableData: orders,
    columnConfig: ordersColumns(onViewOrder),
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {    
    setData(orders);
  }, [orders]);


  return (
    <div>
      <Table
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
