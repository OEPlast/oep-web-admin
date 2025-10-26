'use client';

import { useEffect } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { categoriesColumns } from './columns';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { CategoryType } from '../category-types';
import { useCategories } from '@/hooks/queries/useCategories';
import { useDeleteCategory } from '@/hooks/mutations/useCategoryMutations';
import { Text } from 'rizzui';
import TableSkeleton from './table-skeleton';

export default function CategoriesTable() {
  const { data: categoriesData, isLoading, error } = useCategories({ page: 1, limit: 100 });
  const deleteCategory = useDeleteCategory();
  
  const { table, setData } = useTanStackTable<CategoryType>({
    tableData: categoriesData?.items || [],
    columnConfig: categoriesColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      globalFilterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const searchValue = filterValue.toLowerCase();
        const category = row.original;
        
        // Search across multiple fields
        return (
          category.name.toLowerCase().includes(searchValue) ||
          category.slug.toLowerCase().includes(searchValue) ||
          (category.description?.toLowerCase().includes(searchValue) || false)
        );
      },
      meta: {
        handleDeleteRow: (row) => {
          deleteCategory.mutate(row._id, {
            onSuccess: () => {
              setData((prev) => prev.filter((r) => r._id !== row._id));
            },
          });
        },
        handleMultipleDelete: (rows) => {
          Promise.all(
            rows.map((row: CategoryType) => deleteCategory.mutateAsync(row._id))
          ).then(() => {
            setData((prev) => prev.filter((r) => !rows.some((row: CategoryType) => row._id === r._id)));
          });
        },
      },
      enableColumnResizing: false,
    },
  });

  // Update table data when query data changes
  useEffect(() => {
    console.log(categoriesData);
    
    if (categoriesData?.items) {
      setData(categoriesData.items);
    }
  }, [categoriesData]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text className="text-red-600">Error loading categories: {error.message}</Text>
      </div>
    );
  }

  return (
    <>
      <Filters table={table} />
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
