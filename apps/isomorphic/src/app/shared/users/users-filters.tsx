'use client';

import { useEffect, useState } from 'react';
import type { Table as ReactTableType } from '@tanstack/react-table';
import { PiFunnel, PiMagnifyingGlassBold, PiTrashDuotone, PiArrowsClockwise } from 'react-icons/pi';
import { Button, Flex, Input, Select, Badge, Text } from 'rizzui';
import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import ToggleColumns from '@core/components/table-utils/toggle-columns';
import StatusField from '@core/components/controlled-table/status-field';
import type { UserFilters, UserRole } from '@/types/user';
import { useDebounce } from '@/hooks/use-debounce';

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'owner', label: 'Owner' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

interface UsersFiltersProps<T extends Record<string, any>> {
  filters: UserFilters;
  onFilterChange: (filters: Partial<UserFilters>) => void;
  onRefresh: () => void;
  table: ReactTableType<T>;
}

export default function UsersFilters<TData extends Record<string, any>>({
  filters,
  onFilterChange,
  onRefresh,
  table,
}: UsersFiltersProps<TData>) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchValue = useDebounce(searchInput, 500);
  const [pendingFilters, setPendingFilters] = useState<Partial<UserFilters>>({});

  useEffect(() => {
    onFilterChange({ search: searchValue, page: 1 });
  }, [searchValue, onFilterChange]);

  const handleApplyFilters = () => {
    if (Object.keys(pendingFilters).length > 0) {
      onFilterChange(pendingFilters);
      setPendingFilters({});
    }
  };
  return (
    <Flex align="center" justify="between" className="mb-4">
      <Input
        type="search"
        placeholder="Search by name or email..."
        value={searchInput}
        onClear={() => setSearchInput('')}
        onChange={(e) => setSearchInput(e.target.value)}
        inputClassName="h-9"
        clearable={true}
        prefix={<PiMagnifyingGlassBold className="size-4" />}
      />

      <FilterDrawerView
        isOpen={openDrawer}
        drawerTitle="User Filters"
        setOpenDrawer={setOpenDrawer}
        onApply={handleApplyFilters}
      >
        <div className="grid grid-cols-1 gap-6">
          <FilterElements
            filters={filters}
            pendingFilters={pendingFilters}
            setPendingFilters={setPendingFilters}
            table={table}
          />
        </div>
      </FilterDrawerView>

      <Flex align="center" gap="3" className="w-auto">

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

interface FilterElementsProps<T extends Record<string, any>> {
  filters: UserFilters;
  pendingFilters: Partial<UserFilters>;
  setPendingFilters: React.Dispatch<React.SetStateAction<Partial<UserFilters>>>;
  table: ReactTableType<T>;
}

function FilterElements<T extends Record<string, any>>({
  filters,
  pendingFilters,
  setPendingFilters,
  table,
}: FilterElementsProps<T>) {
  const [localRole, setLocalRole] = useState<UserRole | undefined>(filters.role);
  const [localSort, setLocalSort] = useState<'1' | '-1'>(filters.sort || '-1');

  const handleRoleChange = (value: string | string[]) => {
    const roles = Array.isArray(value) ? value : [value];
    const role = roles.length > 0 ? (roles[0] as UserRole) : undefined;
    setLocalRole(role);
    setPendingFilters((prev) => ({
      ...prev,
      role,
      page: 1,
    }));
  };

  const handleSortChange = (value: string) => {
    const sort = value as '1' | '-1';
    setLocalSort(sort);
    setPendingFilters((prev) => ({
      ...prev,
      sort,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setLocalRole(undefined);
    setLocalSort('-1');
    setPendingFilters({
      role: undefined,
      search: '',
      sort: '-1',
      page: 1,
    });
    table.resetGlobalFilter();
  };

  const isFiltered = filters.role || table.getState().globalFilter;

  return (
    <>
      <StatusField
        options={roleOptions}
        value={localRole ? [localRole] : []}
        onChange={handleRoleChange}
        getOptionValue={(option: any) => option.value}
        getOptionDisplayValue={(option: any) =>
          renderRoleDisplayValue(option.value as string)
        }
        displayValue={(selected: string) => renderRoleDisplayValue(selected)}
        dropdownClassName="!z-20 h-auto"
        className="w-auto"
        label="Role"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Sort Order</label>
          <Select
            options={[
              { value: '-1', label: 'Newest First' },
              { value: '1', label: 'Oldest First' },
            ]}
            value={localSort}
            onChange={handleSortChange}
            displayValue={(selected: string) =>
              selected === '1' ? 'Oldest First' : 'Newest First'
            }
            className="w-full"
          />
        </div>
      </div>

      {isFiltered && (
        <Button
          size="sm"
          onClick={handleClearFilters}
          variant="flat"
          className="h-9 bg-gray-200/70"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      )}
    </>
  );
}

function renderRoleDisplayValue(value: string) {
  const roleColors: Record<string, string> = {
    owner: 'danger',
    manager: 'warning',
    employee: 'info',
    user: 'secondary',
  };

  const color = roleColors[value] || 'secondary';

  return (
    <div className="flex items-center">
      <Badge color={color as any} renderAsDot />
      <Text className="ms-2 font-medium capitalize">{value}</Text>
    </div>
  );
}

