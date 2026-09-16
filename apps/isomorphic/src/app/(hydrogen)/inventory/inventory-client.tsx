'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input, Select, Switch } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { useDebounce } from '@/hooks/use-debounce';
import { useInventory, type InventoryFilters } from '@/hooks/queries/useInventory';
import InventoryTable from '@/app/shared/inventory/inventory-table';

const statusOptions = [
  { label: 'All listings', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
];

export default function InventoryClient() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<InventoryFilters>({
    page: 1,
    limit: 25,
    lowOnly: searchParams.get('low') === '1',
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, q: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  const { data, isLoading } = useInventory(filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          placeholder="Search by name, brand or tag"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
          clearable
          onClear={() => setSearch('')}
          className="w-full sm:w-72"
        />
        <Select
          placeholder="Listing"
          value={statusOptions.find((o) => o.value === (filters.status ?? ''))}
          onChange={(option: { value: string }) =>
            setFilters((prev) => ({ ...prev, status: (option.value || undefined) as InventoryFilters['status'], page: 1 }))
          }
          options={statusOptions}
          className="w-44"
        />
        <Switch
          label="Low stock only"
          checked={!!filters.lowOnly}
          onChange={(e) => setFilters((prev) => ({ ...prev, lowOnly: e.target.checked || undefined, page: 1 }))}
        />
      </div>

      <InventoryTable
        data={data}
        isLoading={isLoading}
        page={filters.page ?? 1}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
