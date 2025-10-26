'use client';

import { useEffect } from 'react';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { bannersColumns } from './columns';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { BannerType } from '../banner-types';
import { useBanners } from '@/hooks/queries/useBanners';
import { useDeleteBanner } from '@/hooks/mutations/useBannerMutations';
import { Text } from 'rizzui';

export default function BannersTable() {
  const { data: bannersData, isLoading, error } = useBanners({ page: 1, limit: 100 });
  const deleteBanner = useDeleteBanner();
  
  const { table, setData } = useTanStackTable<BannerType>({
    tableData: bannersData?.items || [],
    columnConfig: bannersColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      globalFilterFn: (row, columnId, filterValue) => {
        const searchValue = filterValue.toLowerCase();
        const banner = row.original;
        
        // Search across multiple fields
        return (
          banner.name.toLowerCase().includes(searchValue) ||
          banner.pageLink.toLowerCase().includes(searchValue) ||
          banner.category.toLowerCase().includes(searchValue)
        );
      },
      meta: {
        handleDeleteRow: (row) => {
          deleteBanner.mutate(row._id, {
            onSuccess: () => {
              setData((prev) => prev.filter((r) => r._id !== row._id));
            },
          });
        },
        handleMultipleDelete: (rows) => {
          // Delete multiple banners sequentially
          Promise.all(
            rows.map((row: BannerType) => deleteBanner.mutateAsync(row._id))
          ).then(() => {
            setData((prev) => prev.filter((r) => !rows.some((row: BannerType) => row._id === r._id)));
          });
        },
      },
      enableColumnResizing: false,
    },
  });

  // Update table data when query data changes
  useEffect(() => {
    if (bannersData?.items) {
      setData(bannersData.items);
    }
  }, [bannersData, setData]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text className="text-red-600">Error loading banners: {error.message}</Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text>Loading banners...</Text>
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
