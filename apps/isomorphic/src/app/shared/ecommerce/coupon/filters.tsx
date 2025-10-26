'use client';

import ToggleColumns from '@core/components/table-utils/toggle-columns';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { Flex, Input, Select } from 'rizzui';

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
  search?: string;
  onSearchChange?: (value: string) => void;
  activeFilter?: boolean | undefined;
  onActiveFilterChange?: (value: boolean | undefined) => void;
}

const activeFilterOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export default function Filters<TData extends Record<string, any>>({
  table,
  search = '',
  onSearchChange,
  activeFilter,
  onActiveFilterChange,
}: TableToolbarProps<TData>) {
  const handleActiveFilterChange = (value: string) => {
    if (value === '') {
      onActiveFilterChange?.(undefined);
    } else {
      onActiveFilterChange?.(value === 'true');
    }
  };

  return (
    <Flex align="center" justify="between" className="mb-4 gap-3">
      <div className="flex flex-1 items-center gap-3">
        <Input
          type="search"
          placeholder="Search coupons..."
          value={search}
          onClear={() => onSearchChange?.('')}
          onChange={(e) => onSearchChange?.(e.target.value)}
          inputClassName="h-9"
          clearable={true}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="w-full max-w-md"
        />

        <Select
          options={activeFilterOptions}
          value={activeFilter === undefined ? '' : activeFilter.toString()}
          onChange={handleActiveFilterChange}
          placeholder="Filter by status"
          className="w-40"
        />
      </div>

      <ToggleColumns table={table} />
    </Flex>
  );
}
