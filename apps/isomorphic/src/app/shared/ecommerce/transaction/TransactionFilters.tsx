/**
 * Transaction Filters Component
 * Advanced filtering for transactions list
 */

'use client';

import { useState, useEffect } from 'react';
import { Input, Select, Button, Switch } from 'rizzui';
import { PiMagnifyingGlassBold, PiTrashDuotone } from 'react-icons/pi';
import type {
  TransactionFilters as TransactionFiltersType,
  TransactionStatus,
  PaymentMethod,
  TransactionGateway,
} from '@/types/transaction.types';
import { useDebounce } from '@/hooks/use-debounce';

interface TransactionFiltersProps {
  currentParams: TransactionFiltersType;
  onChange: (params: Partial<TransactionFiltersType>) => void;
}

const statusOptions: { label: string; value: TransactionStatus | '' }[] = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Partially Refunded', value: 'partially_refunded' },
];

const methodOptions: { label: string; value: PaymentMethod | '' }[] = [
  { label: 'All Methods', value: '' },
  { label: 'Paystack', value: 'paystack' },
  { label: 'Cash on Delivery', value: 'cash_on_delivery' },
];

export default function TransactionFilters({
  currentParams,
  onChange,
}: TransactionFiltersProps) {
  const [search, setSearch] = useState(currentParams.search || '');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch !== currentParams.search) {
      onChange({
        search: debouncedSearch || undefined,
      });
    }
  }, [debouncedSearch]);

  const handleClearFilters = () => {
    setSearch('');
    onChange({
      search: undefined,
      status: undefined,
      paymentMethod: undefined,
      paymentGateway: undefined,
      userId: undefined,
      orderId: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      needsReview: undefined,
    });
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input
        type="text"
        placeholder="Search by reference or transaction ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
        clearable
        onClear={() => setSearch('')}
        className="w-full sm:w-64"
      />

      <Select
        placeholder="Status"
        value={currentParams.status || 'All status'}
        onChange={(value: { value?: TransactionStatus }) =>
          onChange({ status: value.value || undefined })
        }
        options={statusOptions}
        className="w-40"
      />

      {/* <Select
        placeholder="Payment Method"
        value={currentParams.paymentMethod || 'All Payment Methods'}
        onChange={(value: { value: PaymentMethod }) =>
          onChange({ paymentMethod: value.value || undefined })
        }
        options={methodOptions}
        className="w-44"
      /> */}

      <Switch
        label="Needs review"
        checked={!!currentParams.needsReview}
        onChange={(e) => onChange({ needsReview: e.target.checked || undefined })}
        className="self-center"
      />

      <Button variant="outline" onClick={handleClearFilters} size="sm">
        <PiTrashDuotone className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
