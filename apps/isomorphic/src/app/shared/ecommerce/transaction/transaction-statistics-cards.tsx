/**
 * Transaction Statistics Cards
 * Displays key metrics for transaction management
 */

'use client';

import { Text, Loader } from 'rizzui';
import cn from '@core/utils/class-names';
import {
  PiCurrencyDollarDuotone,
  PiReceiptDuotone,
  PiCheckCircleDuotone,
  PiClockDuotone,
  PiXCircleDuotone,
  PiArrowCounterClockwiseDuotone,
} from 'react-icons/pi';
import { useTransactionStatistics } from '@/hooks/queries/useTransactions';
import type { TransactionStatistics } from '@/types/transaction.types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  description?: string;
}

const StatCard = ({ title, value, icon, variant, description }: StatCardProps) => {
  const variantClasses = {
    primary: 'bg-primary-lighter/20 text-primary',
    success: 'bg-green-lighter/20 text-green-dark',
    warning: 'bg-orange-lighter/20 text-orange-dark',
    danger: 'bg-red-lighter/20 text-red-dark',
    info: 'bg-blue-lighter/20 text-blue-dark',
    secondary: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="rounded-lg border border-muted bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Text className="mb-1 text-sm font-medium text-gray-600">{title}</Text>
          <Text className="text-2xl font-bold text-gray-900">{value}</Text>
          {description && (
            <Text className="mt-1 text-xs text-gray-500">{description}</Text>
          )}
        </div>
        <div className={cn('rounded-lg p-3', variantClasses[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function TransactionStatisticsCards() {
  const { data: statistics, isLoading, error } = useTransactionStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex h-32 items-center justify-center rounded-lg border border-muted bg-white"
          >
            <Loader variant="spinner" size="sm" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <Text className="text-red-600">
          Failed to load transaction statistics. Please try again.
        </Text>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <StatCard
        title="Total Transactions"
        value={formatNumber(statistics.total)}
        icon={<PiReceiptDuotone className="h-6 w-6" />}
        variant="primary"
        description="All time"
      />

      {/* Completed Transactions */}
      <StatCard
        title="Completed"
        value={formatNumber(statistics.completed)}
        icon={<PiCheckCircleDuotone className="h-6 w-6" />}
        variant="success"
        description={`${((statistics.completed / statistics.total) * 100).toFixed(1)}% of total`}
      />

      {/* Pending Transactions */}
      <StatCard
        title="Pending"
        value={formatNumber(statistics.pending)}
        icon={<PiClockDuotone className="h-6 w-6" />}
        variant="warning"
        description="Awaiting payment"
      />

      {/* Failed Transactions */}
      <StatCard
        title="Failed"
        value={formatNumber(statistics.failed)}
        icon={<PiXCircleDuotone className="h-6 w-6" />}
        variant="danger"
        description="Payment unsuccessful"
      />

      {/* Total Revenue */}
      <StatCard
        title="Total Revenue"
        value={formatCurrency(statistics.totalRevenue)}
        icon={<PiCurrencyDollarDuotone className="h-6 w-6" />}
        variant="success"
        description="From completed transactions"
      />

      {/* Total Refunded */}
      <StatCard
        title="Total Refunded"
        value={formatCurrency(statistics.totalRefunded)}
        icon={<PiArrowCounterClockwiseDuotone className="h-6 w-6" />}
        variant="info"
        description={`${statistics.refunded + statistics.partially_refunded} refunds processed`}
      />

      {/* Average Transaction Value */}
      <StatCard
        title="Avg. Transaction"
        value={formatCurrency(statistics.averageTransactionValue)}
        icon={<PiCurrencyDollarDuotone className="h-6 w-6" />}
        variant="primary"
        description="Per transaction"
      />

      {/* Today's Revenue */}
      <StatCard
        title="Today's Revenue"
        value={formatCurrency(statistics.todayRevenue)}
        icon={<PiCurrencyDollarDuotone className="h-6 w-6" />}
        variant="success"
        description={`Last 7 days: ${formatNumber(statistics.recentTransactions)} txns`}
      />
    </div>
  );
}
