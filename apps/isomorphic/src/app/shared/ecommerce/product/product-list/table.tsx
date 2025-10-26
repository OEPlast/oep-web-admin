'use client';

import { useProductsEnhanced, Product } from '@/hooks/queries/useProducts';
import { useDeleteProduct, useDuplicateProduct } from '@/hooks/mutations/useProductMutations';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { productsListColumns } from './columns';
import Filters from './filters';
import TableFooter from '@core/components/table/footer';
import { TableClassNameProps } from '@core/components/table/table-types';
import cn from '@core/utils/class-names';
import { exportToCSV } from '@core/utils/export-to-csv';
import { Alert } from 'rizzui';
import { handleApiError } from '@/libs/axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TableSkeleton from './table-skeleton';

export default function ProductsTable({
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
  const { data: productsData, isLoading, error, isError } = useProductsEnhanced();
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();
  const [componentError, setComponentError] = useState<string | null>(null);

  const products = productsData?.data || [];

  const { table, setData } = useTanStackTable<Product>({
    tableData: products,
    columnConfig: productsListColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: pageSize,
        },
      },
      meta: {
        handleDeleteRow: (row: Product) => {
          if (!row._id) return;
          
          deleteProduct.mutate(row._id, {
            onSuccess: () => {
              setComponentError(null);
            },
            onError: (error) => {
              const errorMessage = handleApiError(error);
              setComponentError(errorMessage);
            },
          });
        },
        // @ts-ignore - Custom meta property not in base TableMeta type
        handleDuplicateRow: (row: Product) => {
          if (!row._id) return;

          duplicateProduct.mutate(row._id, {
            onSuccess: (data) => {
              setComponentError(null);
              toast.success(`Product duplicated: ${data.name}`);
            },
            onError: (error) => {
              const errorMessage = handleApiError(error);
              setComponentError(errorMessage);
              toast.error(errorMessage);
            },
          });
        },
        handleMultipleDelete: (ids: string[]) => {
          // TODO: Implement batch delete when backend supports it
          toast.error('Batch delete not yet implemented');
        },
      },
      enableColumnResizing: false,
    },
  });

  // Sync table data with React Query data
  useEffect(() => {
    if (productsData?.data) {
      setData(productsData.data);
    }
  }, [productsData, setData]);

  const selectedData = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  function handleExportData() {
    exportToCSV(
      selectedData,
      'ID,Name,SKU,Category,Price,Stock,Status,Rating',
      `products_export_${selectedData.length}`
    );
  }

  // Show loading skeleton
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Show error alert
  if (isError) {
    return (
      <Alert color="danger" className="mb-4">
        <strong>Failed to load products:</strong> {handleApiError(error)}
      </Alert>
    );
  }

  // Show mutation errors
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
        <TablePagination
          table={table}
          className={cn('py-4', paginationClassName)}
        />
      )}
    </>
  );
}
