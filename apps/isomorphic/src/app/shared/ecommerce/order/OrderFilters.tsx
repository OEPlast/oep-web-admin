'use client';

import { useState, useEffect } from 'react';
import { OrdersQueryParams, OrderStatus, PaymentStatus } from '@/types/order.types';
import { Input, Select, Button } from 'rizzui';
import { PiMagnifyingGlassBold, PiTrashDuotone } from 'react-icons/pi';
import { useDebounce } from '@/hooks/use-debounce';

interface OrderFiltersProps {
  currentParams: OrdersQueryParams;
  onChange: (params: Partial<OrdersQueryParams>) => void;
}

export default function OrderFilters({ currentParams, onChange }: OrderFiltersProps) {
  const [search, setSearch] = useState(currentParams.search || '');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch !== currentParams.search) {
      onChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleClearFilters = () => {
    setSearch('');
    onChange({
      search: '',
      status: undefined,
      paymentStatus: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input
        type="text"
        placeholder="Search by order#, customer, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
        clearable
        onClear={() => setSearch('')}
        className="w-full sm:w-64"
      />

      <Select
        placeholder="Order Status"
        value={currentParams.status || ''}
        onChange={(value: any) => onChange({ status: value || undefined })}
        options={[
          { label: 'All Statuses', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Processing', value: 'processing' },
          { label: 'Shipped', value: 'shipped' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Refunded', value: 'refunded' },
        ]}
        className="w-40"
      />

      <Select
        placeholder="Payment Status"
        value={currentParams.paymentStatus || ''}
        onChange={(value: any) => onChange({ paymentStatus: value || undefined })}
        options={[
          { label: 'All Payments', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Paid', value: 'paid' },
          { label: 'Failed', value: 'failed' },
          { label: 'Refunded', value: 'refunded' },
        ]}
        className="w-40"
      />

      <Button variant="outline" onClick={handleClearFilters} size="sm">
        <PiTrashDuotone className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
