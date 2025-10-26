'use client';

import { useState } from 'react';
import {
  useTransactions,
} from '@/hooks/queries/useTransactions';
import type {
  TransactionFilters as FilterType,
  Transaction,
} from '@/types/transaction.types';
import TransactionStatisticsCards from '@/app/shared/ecommerce/transaction/transaction-statistics-cards';
import TransactionFilters from '@/app/shared/ecommerce/transaction/TransactionFilters';
import TransactionsTable from '@/app/shared/ecommerce/transaction/TransactionsTable';
import TransactionDetailDrawer from '@/app/shared/ecommerce/transaction/transaction-detail-drawer';

export default function TransactionsClient() {
  // Filters state
  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 10,
  });

  // Detail drawer state
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch transactions with filters and pagination
  const {
    data: transactionsData,
    isLoading,
    error,
  } = useTransactions(filters);

  const transactions = transactionsData?.transactions || [];

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterType>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle view details
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransactionId(transaction._id);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <TransactionStatisticsCards />

      {/* Filters */}
      <TransactionFilters
        currentParams={filters}
        onChange={handleFilterChange}
      />

      {/* Table */}
      <TransactionsTable
        transactions={transactions}
        onViewTransaction={handleViewTransaction}
        isLoading={isLoading}
      />

      {/* Transaction Detail Drawer */}
      {isDrawerOpen && selectedTransactionId && (
        <TransactionDetailDrawer
          transactionId={selectedTransactionId}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedTransactionId(null);
          }}
        />
      )}
    </div>
  );
}
