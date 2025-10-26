'use client';

import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import ToggleColumns from '@core/components/table-utils/toggle-columns';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { useState } from 'react';
import {
  PiFunnel,
  PiMagnifyingGlassBold,
  PiTrash,
  PiTrashDuotone,
} from 'react-icons/pi';
import { Button, Flex, Input, Select } from 'rizzui';
import { useParentCategoryOptions } from '@/hooks/queries/useParentCategoryOptions';

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
}

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

const availabilityOptions = [
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock', value: 'low-stock' },
  { label: 'Out of Stock', value: 'out-of-stock' },
];

export default function Filters<TData extends Record<string, any>>({
  table,
}: TableToolbarProps<TData>) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const isMultipleSelected = table.getSelectedRowModel().rows.length > 1;

  const {
    options: { meta },
  } = table;

  return (
    <Flex align="center" justify="between" className="mb-4">
      <Input
        type="search"
        placeholder="Search by product name or SKU..."
        value={table.getState().globalFilter ?? ''}
        onClear={() => table.setGlobalFilter('')}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        inputClassName="h-9"
        clearable={true}
        prefix={<PiMagnifyingGlassBold className="size-4" />}
        className="w-full max-w-md"
      />

      <FilterDrawerView
        isOpen={openDrawer}
        drawerTitle="Product Filters"
        setOpenDrawer={setOpenDrawer}
      >
        <div className="grid grid-cols-1 gap-6">
          <FilterElements table={table} />
        </div>
      </FilterDrawerView>

      <Flex align="center" gap="3" className="w-auto">
        {isMultipleSelected ? (
          <Button
            color="danger"
            variant="outline"
            className="h-[34px] gap-2 text-sm"
            onClick={() => {
              const metaWithDelete = meta as any;
              metaWithDelete?.handleMultipleDelete &&
                metaWithDelete.handleMultipleDelete(
                  table.getSelectedRowModel().rows.map((r) => r.original._id)
                );
            }}
          >
            <PiTrash size={18} />
            Delete {table.getSelectedRowModel().rows.length} items
          </Button>
        ) : null}

        <Button
          variant="outline"
          onClick={() => setOpenDrawer(!openDrawer)}
          className="h-9 pe-3 ps-2.5"
        >
          <PiFunnel className="me-1.5 size-[18px]" strokeWidth={1.7} />
          Filters
        </Button>

        <ToggleColumns table={table} />
      </Flex>
    </Flex>
  );
}

function FilterElements<T extends Record<string, any>>({
  table,
}: TableToolbarProps<T>) {
  const { data: categories } = useParentCategoryOptions();

  const categoryValue = table.getColumn('category')?.getFilterValue() as
    | string
    | undefined;
  const statusValue = table.getColumn('status')?.getFilterValue() as
    | string
    | undefined;

  const isFiltered =
    table.getState().globalFilter || table.getState().columnFilters.length > 0;

  return (
    <>
      <Select
        label="Category"
        placeholder="Select category"
        options={categories || []}
        value={categoryValue}
        onChange={(value: any) => {
          table.getColumn('category')?.setFilterValue(value?.value || '');
        }}
        getOptionValue={(option: any) => option.value}
        displayValue={(selected: string) =>
          categories?.find((c: any) => c.value === selected)?.label ?? ''
        }
        clearable
        onClear={() => table.getColumn('category')?.setFilterValue('')}
      />

      <Select
        label="Status"
        placeholder="Select status"
        options={statusOptions}
        value={statusValue}
        onChange={(value: any) => {
          table.getColumn('status')?.setFilterValue(value?.value || '');
        }}
        getOptionValue={(option: any) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((s) => s.value === selected)?.label ?? ''
        }
        clearable
        onClear={() => table.getColumn('status')?.setFilterValue('')}
      />

      {isFiltered && (
        <Button
          size="sm"
          onClick={() => {
            table.resetGlobalFilter();
            table.resetColumnFilters();
          }}
          variant="flat"
          className="h-9 bg-gray-200/70"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear Filters
        </Button>
      )}
    </>
  );
}
