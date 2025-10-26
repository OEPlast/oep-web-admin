'use client';

import ToggleColumns from '@core/components/table-utils/toggle-columns';
import { type Table as ReactTableType } from '@tanstack/react-table';
import { PiMagnifyingGlassBold, PiArrowsClockwise } from 'react-icons/pi';
import { Flex, Input, Select, SelectOption, Button } from 'rizzui';
import { SalesFilters, SaleType } from '@/types/sales';

interface TableToolbarProps<T extends Record<string, any>> {
  table: ReactTableType<T>;
  filters: SalesFilters;
  onFilterChange: (filters: Partial<SalesFilters>) => void;
  onRefresh: () => void;
}

export default function Filters<TData extends Record<string, any>>({
  table,
  filters,
  onFilterChange,
  onRefresh,
}: TableToolbarProps<TData>) {
  return (
    <div className="mb-4 space-y-3">
      <Flex align="center" justify="between" gap="3">
        <Input
          type="search"
          placeholder="Search by title, product name..."
          value={filters.search ?? ''}
          onClear={() => onFilterChange({ search: '' })}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          inputClassName="h-10"
          clearable={true}
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="w-full max-w-md"
        />

        <div className="flex items-center gap-3">
          <Select
            placeholder="Sale Type"
            options={[
              { value: '', label: 'All Types' },
              { value: 'Flash', label: 'Sale' },
              { value: 'Limited', label: 'Limited Sale' },
              { value: 'Normal', label: 'Normal Sale' },
            ]}
            value={filters.type || ''}
            onChange={(option: SelectOption) =>
              onFilterChange({ type: (option?.value as SaleType) || undefined })
            }
            className="w-40"
          />

          <Select
            placeholder="Status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            value={
              filters.isActive === undefined
                ? ''
                : filters.isActive
                  ? 'true'
                  : 'false'
            }
            onChange={(option: SelectOption) => {
              const value = option?.value;
              onFilterChange({
                isActive:
                  value === '' ? undefined : value === 'true',
              });
            }}
            className="w-40"
          />

          <Button
            variant="outline"
            onClick={onRefresh}
            className="gap-2"
          >
            <PiArrowsClockwise className="size-4" />
            Refresh
          </Button>

          <ToggleColumns table={table} />
        </div>
      </Flex>
    </div>
  );
}
