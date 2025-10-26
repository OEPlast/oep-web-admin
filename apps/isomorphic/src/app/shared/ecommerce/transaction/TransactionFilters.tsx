/**
 * Transaction Filters Component
 * Advanced filtering for transactions list
 */

'use client';

import { useState, useEffect } from 'react';
import { Input, Select, Button } from 'rizzui';
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
  { label: 'Stripe', value: 'stripe' },
  { label: 'Paystack', value: 'paystack' },
  { label: 'Flutterwave', value: 'flutterwave' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cash on Delivery', value: 'cash_on_delivery' },
];

const gatewayOptions: { label: string; value: TransactionGateway | '' }[] = [
  { label: 'All Gateways', value: '' },
  { label: 'Paystack', value: 'paystack' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'Flutterwave', value: 'flutterwave' },
  { label: 'Manual', value: 'manual' },
];

export default function TransactionFilters({
  currentParams,
  onChange,
}: TransactionFiltersProps) {
  const [search, setSearch] = useState(currentParams.reference || currentParams.transactionId || '');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch !== (currentParams.reference || currentParams.transactionId)) {
      onChange({ 
        reference: debouncedSearch || undefined,
        transactionId: debouncedSearch || undefined,
      });
    }
  }, [debouncedSearch]);

  const handleClearFilters = () => {
    setSearch('');
    onChange({
      reference: undefined,
      transactionId: undefined,
      status: undefined,
      paymentMethod: undefined,
      paymentGateway: undefined,
      userId: undefined,
      orderId: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
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
        value={currentParams.status || ''}
        onChange={(value: any) => onChange({ status: value || undefined })}
        options={statusOptions}
        className="w-40"
      />

      <Select
        placeholder="Payment Method"
        value={currentParams.paymentMethod || ''}
        onChange={(value: any) => onChange({ paymentMethod: value || undefined })}
        options={methodOptions}
        className="w-44"
      />

      <Select
        placeholder="Gateway"
        value={currentParams.paymentGateway || ''}
        onChange={(value: any) => onChange({ paymentGateway: value || undefined })}
        options={gatewayOptions}
        className="w-40"
      />

      <Button variant="outline" onClick={handleClearFilters} size="sm">
        <PiTrashDuotone className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
