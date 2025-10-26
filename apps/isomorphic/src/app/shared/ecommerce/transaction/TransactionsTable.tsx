'use client';

import { Transaction } from '@/types/transaction.types';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { transactionsColumns } from './columns';

interface TransactionsTableProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export default function TransactionsTable({
  transactions,
  onViewTransaction,
  isLoading = false,
}: TransactionsTableProps) {
  const { table, setData } = useTanStackTable<Transaction>({
    tableData: transactions,
    columnConfig: transactionsColumns(onViewTransaction),
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
      <TablePagination table={table} className="py-4" />
    </div>
  );
}
