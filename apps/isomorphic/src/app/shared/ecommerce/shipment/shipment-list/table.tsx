'use client';

import { useEffect, useState } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { TableClassNameProps } from '@core/components/table/table-types';
import cn from '@core/utils/class-names';
import { Alert } from 'rizzui';
import toast from 'react-hot-toast';
import { exportToCSV } from '@core/utils/export-to-csv';
import { handleApiError } from '@/libs/axios';
import { useShipments, useDeleteShipment } from '@/hooks/use-shipment';
import type { Shipment } from '@/types/shipment.types';
import { shipmentsListColumns } from './columns';
import Filters from './filters';
import TableFooter from '@core/components/table/footer';
import TableSkeleton from './table-skeleton';

export default function ShipmentsTable({
  pageSize = 10,
  hideFilters = false,
  hidePagination = false,
  hideFooter = false,
  classNames = {
    container: 'border border-muted rounded-md',
    rowClassName: 'last:border-0',
  },
  paginationClassName,
}: {
  pageSize?: number;
  hideFilters?: boolean;
  hidePagination?: boolean;
  hideFooter?: boolean;
  classNames?: TableClassNameProps;
  paginationClassName?: string;
}) {
  // Fetch shipments (first page with a larger limit to allow client-side pagination similar to Products)
  const { data, isLoading, error, isError } = useShipments({ page: 1, limit: 200 });
  const deleteShipment = useDeleteShipment();
  const [componentError, setComponentError] = useState<string | null>(null);

  const shipments: Shipment[] = data?.shipments || [];

  const { table, setData } = useTanStackTable<Shipment>({
    tableData: shipments,
    columnConfig: shipmentsListColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: pageSize,
        },
      },
      meta: {
        handleDeleteRow: (row: Shipment) => {
          deleteShipment.mutate(row._id, {
            onSuccess: () => setComponentError(null),
            onError: (err) => setComponentError(handleApiError(err)),
          });
        },
      },
      enableColumnResizing: false,
    },
  });

  // Sync table data with React Query data
  useEffect(() => {
    if (data?.shipments) {
      setData(data.shipments);
    }
  }, [data, setData]);

  const selectedData = table.getSelectedRowModel().rows.map((r) => r.original);

  function handleExportData() {
    exportToCSV(
      selectedData,
      'ID,Tracking Number,Order,Courier,Status,Estimated Delivery,Cost',
      `shipments_export_${selectedData.length}`
    );
  }

  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <Alert color="danger" className="mb-4">
        <strong>Failed to load shipments:</strong> {handleApiError(error)}
      </Alert>
    );
  }

  if (componentError) {
    return (
      <Alert color="danger" className="mb-4" onClose={() => setComponentError(null)}>
        <strong>Error:</strong> {componentError}
      </Alert>
    );
  }

  return (
    <>
      {!hideFilters && <Filters table={table} />}
      <Table table={table} variant="modern" classNames={classNames} />
      {!hideFooter && <TableFooter table={table} onExport={handleExportData} />}
      {!hidePagination && (
        <TablePagination table={table} className={cn('py-4', paginationClassName)} />
      )}
    </>
  );
}
