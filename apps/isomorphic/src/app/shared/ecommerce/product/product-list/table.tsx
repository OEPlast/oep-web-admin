'use client';

import { useProductsEnhanced, Product } from '@/hooks/queries/useProducts';
import {
  useDeleteProduct,
  useDuplicateProduct,
} from '@/hooks/mutations/useProductMutations';
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
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import TableSkeleton from './table-skeleton';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { PaginationState } from '@tanstack/react-table';
import { useAdminProductSocket } from '@/hooks/useAdminProductSocket';

export default function ProductsTable({
  pageSize = 20,
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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState<string | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [availabilityFilter, setAvailabilityFilter] = useState<'in-stock' | 'out-of-stock' | 'low-stock' | undefined>();

  const {
    data: productsData,
    isLoading,
    error,
    isError,
  } = useProductsEnhanced({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchFilter,
    category: categoryFilter,
    availability: availabilityFilter,
  });
  const deleteProduct = useDeleteProduct();
  const duplicateProduct = useDuplicateProduct();
  const [componentError, setComponentError] = useState<string | null>(null);
  const router = useRouter();

  const products = productsData?.data || [];
  const visibleProductIds = useMemo(() => products.map((p) => p._id), [products]);
  useAdminProductSocket({ productIds: visibleProductIds, enabled: !isLoading });

  const { table, setData } = useTanStackTable<Product>({
    tableData: products,
    columnConfig: productsListColumns,

    options: {
      manualPagination: true,
      manualFiltering: true, // We handle filtering manually
      pageCount: productsData?.meta.pages,
      state: {
        pagination,
        globalFilter,
      },
      onPaginationChange: setPagination,
      onGlobalFilterChange: setGlobalFilter,
      initialState: {
        columnVisibility: {
          category: false, // Hide the category column (used only for filtering)
        },
      },
      meta: {
        // @ts-ignore - Custom meta properties for filters
        searchFilter,
        categoryFilter,
        statusFilter,
        availabilityFilter,
        setSearchFilter: (value: string | undefined) => {
          setSearchFilter(value);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        },
        setCategoryFilter: (value: string | undefined) => {
          setCategoryFilter(value);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        },
        setStatusFilter,
        setAvailabilityFilter: (value: 'in-stock' | 'out-of-stock' | 'low-stock' | undefined) => {
          setAvailabilityFilter(value);
          setPagination(prev => ({ ...prev, pageIndex: 0 }));
        },
        clearFilters: () => {
          setSearchFilter(undefined);
          setCategoryFilter(undefined);
          setStatusFilter(undefined);
          setAvailabilityFilter(undefined);
          setGlobalFilter('');
        },
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

          // Show toast immediately
          toast.loading('Duplicating product...', { id: 'duplicate-product' });

          duplicateProduct.mutate(row._id, {
            onSuccess: (data) => {
              setComponentError(null);
              toast.success(`Product duplicated: ${data.name}`, {
                id: 'duplicate-product',
              });

              // Navigate to edit page of the new product
              router.push(routes.eCommerce.ediProduct(data._id));
            },
            onError: (error) => {
              const errorMessage = handleApiError(error);
              setComponentError(errorMessage);
              toast.error(errorMessage, { id: 'duplicate-product' });
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

  useEffect(() => {
    const state = table.getState();
    const newPage = state.pagination.pageIndex;
    if (newPage !== pagination.pageIndex) {
      setPagination((prev) => ({ ...prev, pageIndex: newPage }));
    }
  }, [table.getState().pagination.pageIndex, pagination.pageIndex]);

  // Sync table data with React Query data, with client-side status filtering
  useEffect(() => {
    if (productsData?.data) {
      let filteredData = productsData.data;
      
      // Apply status filter client-side (not supported by API)
      if (statusFilter) {
        filteredData = filteredData.filter(product => product.status === statusFilter);
      }
      
      setData(filteredData);
    }
  }, [productsData, statusFilter, setData]);

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
      <Alert
        color="danger"
        className="mb-4"
        onClose={() => setComponentError(null)}
      >
        <strong>Error:</strong> {componentError}
      </Alert>
    );
  }

  return (
    <>
      {!hideFilters && <Filters table={table} />}

      <Table
        isLoading={isLoading}
        table={table}
        variant="modern"
        classNames={classNames}
      />
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
