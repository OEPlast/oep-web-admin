/**
 * Orders Analytics Client Component
 *
 * Displays comprehensive order analytics including:
 * - Overview metrics (total orders, statuses breakdown)
 * - Orders trend chart over time
 * - Order status distribution (pie chart)
 * - Detailed orders table with filters
 */

'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import { PiShoppingCartDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiClockDuotone, PiTruckDuotone } from 'react-icons/pi';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import AnalyticsSeriesChart from '@/app/shared/analytics/analytics-series-chart';
import AnalyticsSummaryCards from '@/app/shared/analytics/analytics-summary-cards';
import { Text } from 'rizzui';
import { useSeries, useSummary, useBreakdown, useOrdersTable } from '@/hooks/queries/analytics';
import AnalyticsBreakdownChart from '@/app/shared/analytics/analytics-breakdown-chart';
import OrdersDataTable from './components/orders-data-table';

const pageHeader = {
  title: 'Orders Analytics',
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
      name: 'Orders',
    },
  ],
};

export default function OrdersAnalyticsClient() {
  const range = useAnalyticsRange();

  // Table pagination and filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | undefined>('');

  const summary = useSummary({
    metrics: [
      'orders_placed',
      'completions',
      'cancellations',
      'pending_orders',
      // Explicitly "not delivered" rather than leaving it to be inferred from a
      // missing timestamp. Deliveries + awaiting + cancelled accounts for every
      // order placed.
      'awaiting_delivery',
    ],
    ...range.range,
    compare: 'previous',
  });

  const trend = useSeries({
    metrics: ['orders_placed', 'completions'],
    ...range.range,
    granularity: 'auto',
    compare: 'previous',
  });

  const dateParams = {
    from: summary.data?.from ?? new Date(Date.now() - 30 * 864e5).toISOString(),
    to: summary.data?.to ?? new Date().toISOString(),
  };

  // Fetch overview data

  // Fetch trend data

  // Fetch status distribution
  const statusBreakdown = useBreakdown({
    metric: 'orders_placed',
    dimension: 'order_status',
    ...range.range,
  });

  // Fetch orders table data
  const { data: ordersData, isLoading: loadingOrders } = useOrdersTable({
    ...dateParams,
    page,
    limit,
    status: statusFilter === '' ? 'all' : statusFilter,
  });

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <AnalyticsRangePicker range={range} />

      <AnalyticsSummaryCards
        className="mb-6"
        query={summary}
        cards={[
          { metric: 'orders_placed', label: 'Total Orders', icon: PiShoppingCartDuotone },
          { metric: 'completions', label: 'Completed', icon: PiCheckCircleDuotone },
          { metric: 'cancellations', label: 'Cancelled', icon: PiXCircleDuotone },
          { metric: 'pending_orders', label: 'Pending', icon: PiClockDuotone },
          {
            metric: 'awaiting_delivery',
            label: 'Awaiting Delivery',
            icon: PiTruckDuotone,
            isStock: true,
            hint: 'Live orders with no delivery recorded, as of now. Cancelled orders are excluded — they are undelivered, but nothing is waiting on them.',
          },
        ]}
      />

      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 @container lg:grid-cols-2">
        <AnalyticsSeriesChart
          title="Orders Trend"
          query={trend}
          metrics={[
            { key: 'orders_placed', label: 'Placed', color: '#3b82f6' },
            { key: 'completions', label: 'Completed', color: '#10b981' },
          ]}
        />
        <AnalyticsBreakdownChart
          title="Order Status"
          query={statusBreakdown}
          kind="pie"
        />
      </div>

      {/* Orders Table */}
      <OrdersDataTable
        data={ordersData}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(newLimit: number) => {
          setLimit(newLimit);
          setPage(1); // Reset to first page when changing limit
        }}
        onStatusFilter={(status?: string) => {
          setStatusFilter(status);
          setPage(1); // Reset to first page when filtering
        }}
        selectedStatus={statusFilter}
        isLoading={loadingOrders}
      />
    </>
  );
}
