'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLogisticsCountries, useDeleteCountry } from '@/hooks/use-logistics';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { Box, Button, Text, Loader, ActionIcon, Tooltip } from 'rizzui';
import {
  PiTrashDuotone,
  PiNotePencilDuotone,
  PiEyeDuotone,
  PiPlusBold,
} from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import cn from '@core/utils/class-names';
import { createColumnHelper } from '@tanstack/react-table';
import type { CountryListItem } from '@/types/logistics.types';
import DeletePopover from '@core/components/delete-popover';

const columnHelper = createColumnHelper<CountryListItem>();

export default function LogisticsConfigTable() {
  const router = useRouter();
  const { data: countries = [], isLoading, error } = useLogisticsCountries();
  const deleteCountry = useDeleteCountry();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countries;
    const term = searchTerm.toLowerCase();
    return countries.filter(
      (country) =>
        country.countryName.toLowerCase().includes(term) ||
        country.countryCode.toLowerCase().includes(term)
    );
  }, [countries, searchTerm]);
  
  const columns = useMemo(
    () => [
      columnHelper.accessor('countryCode', {
        id: 'countryCode',
        size: 120,
        header: 'Code',
        cell: ({ row }) => (
          <Text className="font-semibold text-gray-900">
            {row.original.countryCode}
          </Text>
        ),
      }),
      columnHelper.accessor('countryName', {
        id: 'countryName',
        size: 300,
        header: 'Country Name',
        cell: ({ row }) => (
          <Text className="font-medium">{row.original.countryName}</Text>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        size: 180,
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Tooltip content="View Details" placement="top">
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(routes.eCommerce.logistics.configDetails(row.original._id))
                }
              >
                <PiEyeDuotone className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
            <Tooltip content="Edit" placement="top">
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(routes.eCommerce.logistics.editConfig(row.original._id))
                }
              >
                <PiNotePencilDuotone className="h-4 w-4" />
              </ActionIcon>
            </Tooltip>
            <DeletePopover
              title="Delete Country"
              description={`Are you sure you want to delete ${row.original.countryName}? This will remove all associated states, cities, and pricing data.`}
              onDelete={() => {
                deleteCountry.mutate(row.original._id);
              }}
            />
          </div>
        ),
      }),
    ],
    [router, deleteCountry]
  );

  const { table, setData } = useTanStackTable<CountryListItem>({
    tableData: filteredCountries,
    columnConfig: columns,
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
    setData(filteredCountries);
  }, [filteredCountries]);


  if (isLoading) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex min-h-[400px] items-center justify-center">
        <Text className="text-red-500">
          Error loading countries: {error.message}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Search by country name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Text className="text-sm text-gray-500">
          {filteredCountries.length}{' '}
          {filteredCountries.length === 1 ? 'country' : 'countries'}
        </Text>
      </div>

      {/* Table */}
      <Table
        table={table}
        variant="modern"
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />

      {/* Pagination */}
      <TablePagination table={table} className="py-4" />

    </Box>
  );
}
