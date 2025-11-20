'use client';

import { useEffect, useState } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { TableClassNameProps } from '@core/components/table/table-types';
import cn from '@core/utils/class-names';
import { Alert } from 'rizzui';
import { handleApiError } from '@/libs/axios';
import { useMyDeliveries } from '@/hooks/queries/useDeliveries';
import type { Shipment } from '@/types/shipment.types';
import DeliveriesColumns from './deliveries-columns';
import TableFooter from '@core/components/table/footer';
// permissions handled inside useDeliveriesColumns
import DeliveryFilters from './delivery-filters';

export default function DeliveryTable({
  pageSize = 10,
  hidePagination = false,
  hideFooter = false,
  classNames = {
    container: 'border border-muted rounded-md',
    rowClassName: 'last:border-0',
  },
  paginationClassName,
}: {
  pageSize?: number;
  hidePagination?: boolean;
  hideFooter?: boolean;
  classNames?: TableClassNameProps;
  paginationClassName?: string;
}) {
  const { data, isLoading, error, isError } = useMyDeliveries({ page: 1, limit: 30 });
  const [componentError, setComponentError] = useState<string | null>(null);

  const deliveries: Shipment[] = data?.shipments || [];

  const { table, setData } = useTanStackTable<Shipment>({
    tableData: deliveries,
  columnConfig: DeliveriesColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize,
        },
      },
      enableColumnResizing: false,
      // Permission gating handled inside column hook
    },
  });

  useEffect(() => {
    if (data?.shipments) {
      setData(data.shipments);
    }
  }, [data, setData]);

  if (isLoading) return <div className="p-6">Loading deliveries...</div>;

  if (isError) {
    return (
      <Alert color="danger" className="mb-4">
        <strong>Failed to load deliveries:</strong> {handleApiError(error)}
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
      <DeliveryFilters table={table} />
      <Table table={table} variant="modern" classNames={classNames} />
      {!hideFooter && <TableFooter table={table} />}
      {!hidePagination && (
        <TablePagination table={table} className={cn('py-4', paginationClassName)} />
      )}
    </>
  );
}
