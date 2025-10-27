'use client';

import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import ToggleColumns from '@core/components/table-utils/toggle-columns';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { useState } from 'react';
import { PiFunnel, PiMagnifyingGlassBold, PiTrashDuotone } from 'react-icons/pi';
import { Button, Flex, Input, Select } from 'rizzui';
import type { ShipmentStatus } from '@/types/shipment.types';
import { SHIPMENT_STATUSES } from '@/types/shipment.types';

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
}

const statusOptions = SHIPMENT_STATUSES.map((s) => ({ label: s, value: s }));

export default function Filters<TData extends Record<string, any>>({ table }: TableToolbarProps<TData>) {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <Flex align="center" justify="between" className="mb-4">
      <Input
        type="search"
        placeholder="Search by tracking number or courier..."
        value={table.getState().globalFilter ?? ''}
        onClear={() => table.setGlobalFilter('')}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        inputClassName="h-9"
        clearable
        prefix={<PiMagnifyingGlassBold className="size-4" />}
        className="w-full max-w-md"
      />

      <FilterDrawerView isOpen={openDrawer} drawerTitle="Shipment Filters" setOpenDrawer={setOpenDrawer}>
        <div className="grid grid-cols-1 gap-6">
          <FilterElements table={table} />
        </div>
      </FilterDrawerView>

      <Flex align="center" gap="3" className="w-auto">
        <Button variant="outline" onClick={() => setOpenDrawer(!openDrawer)} className="h-9 pe-3 ps-2.5">
          <PiFunnel className="me-1.5 size-[18px]" strokeWidth={1.7} />
          Filters
        </Button>

        <ToggleColumns table={table} />
      </Flex>
    </Flex>
  );
}

function FilterElements<T extends Record<string, any>>({ table }: TableToolbarProps<T>) {
  const statusValue = table.getColumn('status')?.getFilterValue() as ShipmentStatus | undefined;
  const isFiltered = table.getState().globalFilter || table.getState().columnFilters.length > 0;

  return (
    <>
      <Select
        label="Status"
        placeholder="Select status"
        options={statusOptions}
        value={statusValue}
        onChange={(value: any) => {
          table.getColumn('status')?.setFilterValue(value?.value || '');
        }}
        getOptionValue={(option: any) => option.value}
        displayValue={(selected: string) => statusOptions.find((s) => s.value === selected)?.label ?? ''}
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
