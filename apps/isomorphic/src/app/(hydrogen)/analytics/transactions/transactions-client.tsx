/**
 * Transactions Analytics Client Component
 *
 * Displays comprehensive transaction analytics including:
 * - Overview metrics (total transactions, amounts, status breakdown)
 * - Transaction status distribution over time (bar chart)
 * - Transactions trend chart over time
 * - Payment methods distribution (pie chart)
 * - Detailed transactions table with filters
 */

'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import {
  PiArrowsLeftRightDuotone,
  PiCurrencyNgnDuotone,
  PiArrowUUpLeftDuotone,
} from 'react-icons/pi';
import { Text } from 'rizzui';
import { useTransactionsTable, useSeries, useSummary, useBreakdown } from '@/hooks/queries/analytics';
import AnalyticsBreakdownChart from '@/app/shared/analytics/analytics-breakdown-chart';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import AnalyticsSeriesChart from '@/app/shared/analytics/analytics-series-chart';
import AnalyticsSummaryCards from '@/app/shared/analytics/analytics-summary-cards';
import TransactionsDataTable from './components/transactions-data-table';

const pageHeader = {
  title: 'Transactions Analytics',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      href: '/analytics',
      name: 'Analytics',
    },
    {
      name: 'Transactions',
    },
  ],
};

export default function TransactionsAnalyticsClient() {
  const range = useAnalyticsRange();
  const statusSeries = useSeries({
    metrics: ['transactions_count'],
    dimension: 'transaction_status',
    ...range.range,
    granularity: 'auto',
  });

  const paymentMethods = useBreakdown({
    metric: 'transactions_count',
    dimension: 'payment_method',
    ...range.range,
  });

  // Table pagination and filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [methodFilter, setMethodFilter] = useState<string | undefined>(
    undefined
  );
  const summary = useSummary({
    metrics: ['transactions_count', 'transactions_amount', 'refunds'],
    ...range.range,
    compare: 'previous',
  });

  const trend = useSeries({
    metrics: ['transactions_count'],
    ...range.range,
    granularity: 'auto',
    compare: 'previous',
  });

  const dateParams = {
    from: summary.data?.from ?? new Date(Date.now() - 30 * 864e5).toISOString(),
    to: summary.data?.to ?? new Date().toISOString(),
  };


  // Fetch transactions table data
  const { data: transactionsData, isLoading: loadingTransactions } =
    useTransactionsTable({
      ...dateParams,
      page,
      limit,
      status: statusFilter === 'all' ? undefined : statusFilter,
      method: methodFilter === 'all' ? undefined : methodFilter,
    });

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <AnalyticsRangePicker range={range} />

      <AnalyticsSummaryCards
        className="mb-6"
        query={summary}
        cards={[
          {
            metric: 'transactions_count',
            label: 'Transactions',
            icon: PiArrowsLeftRightDuotone,
            hint: 'Every attempt, including failures — this is throughput, not income.',
          },
          {
            metric: 'transactions_amount',
            label: 'Value Received',
            icon: PiCurrencyNgnDuotone,
            format: 'currency',
            hint: 'Completed transactions only, measured when the payment actually arrived.',
          },
          {
            metric: 'refunds',
            label: 'Refunded Orders',
            icon: PiArrowUUpLeftDuotone,
            hint: 'Orders carrying a refund marker. Transactions remain authoritative for refund amounts.',
          },
        ]}
      />

      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 @container">
        {/* Transaction Status Distribution - Full Width */}
        {/* Stacked: statuses partition the transaction count, so stack height
            is the total rather than an overlay artefact. */}
        <AnalyticsSeriesChart
          title="Transactions by Status"
          query={statusSeries}
          kind="bar"
          stacked
        />

        {/* Transactions Trend and Payment Methods - Side by Side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnalyticsSeriesChart
            title="Transactions Trend"
            query={trend}
            metrics={[
              { key: 'transactions_count', label: 'Transactions', color: '#6366f1' },
            ]}
          />
          <AnalyticsBreakdownChart
            title="Payment Methods"
            query={paymentMethods}
            kind="pie"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsDataTable
        data={transactionsData}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(newLimit: number) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onStatusFilter={(status?: string) => {
          setStatusFilter(status);
          setPage(1);
        }}
        onMethodFilter={(method?: string) => {
          setMethodFilter(method);
          setPage(1);
        }}
        selectedStatus={statusFilter}
        selectedMethod={methodFilter}
        isLoading={loadingTransactions}
      />
    </>
  );
}
