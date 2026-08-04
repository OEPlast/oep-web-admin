/**
 * Users Analytics
 *
 * Served by the analytics query engine: figures are measured on their own event
 * timestamps, bucketed in the store timezone, and gap-filled.
 */

'use client';

import { useState } from 'react';
import {
  PiUsersDuotone,
  PiUserPlusDuotone,
  PiUserCheckDuotone,
  PiUserMinusDuotone,
} from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import { useSeries, useSummary, useBreakdown } from '@/hooks/queries/analytics';
import AnalyticsBreakdownChart from '@/app/shared/analytics/analytics-breakdown-chart';
import AnalyticsBreakdownTable from '@/app/shared/analytics/analytics-breakdown-table';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import AnalyticsSeriesChart from '@/app/shared/analytics/analytics-series-chart';
import AnalyticsSummaryCards from '@/app/shared/analytics/analytics-summary-cards';

const pageHeader = {
  title: 'Users Analytics',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { href: '/analytics', name: 'Analytics' },
    { name: 'Users' },
  ],
};

export default function UsersAnalyticsClient() {
  const range = useAnalyticsRange();

  // Rankings take a limit, not a page: page 2 of a top-10 is not a top-10.
  const [limit] = useState(10);

  const summary = useSummary({
    metrics: ['new_customers', 'active_users', 'total_users'],
    ...range.range,
    compare: 'previous',
  });

  const acquisition = useSeries({
    metrics: ['new_customers'],
    ...range.range,
    granularity: 'auto',
    compare: 'previous',
  });

  const demographics = useBreakdown({
    metric: 'new_customers',
    dimension: 'country',
    ...range.range,
    limit: 10,
  });

  const topCustomers = useBreakdown({
    metric: 'orders_placed',
    dimension: 'customer',
    ...range.range,
    limit,
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
            metric: 'total_users',
            label: 'Total Users',
            icon: PiUsersDuotone,
            isStock: true,
          },
          { metric: 'new_customers', label: 'New Users', icon: PiUserPlusDuotone },
          {
            metric: 'active_users',
            label: 'Active Customers',
            icon: PiUserCheckDuotone,
            hint: 'Distinct customers who placed an order in the selected period. A repeat customer is counted once.',
          },
          {
            metric: 'inactive_users',
            label: 'Inactive Users',
            icon: PiUserMinusDuotone,
            // Derived rather than queried: "inactive" is the complement of
            // active, not a thing the database records.
            derive: (totals) => {
              const total = Number(totals.total_users ?? 0);
              const active = Number(totals.active_users ?? 0);
              return Math.max(total - active, 0);
            },
            hint: 'Total users minus those who ordered in the selected period.',
          },
        ]}
      />

      <div className="mb-6 grid grid-cols-1 gap-6 @container lg:grid-cols-2">
        <AnalyticsSeriesChart
          title="Customer Acquisition"
          query={acquisition}
          metrics={[{ key: 'new_customers', label: 'New customers', color: '#3b82f6' }]}
        />
        <AnalyticsBreakdownChart
          title="Customers by Country"
          query={demographics}
          kind="pie"
        />
      </div>

      <AnalyticsBreakdownTable
        title="Top Customers"
        description="By orders placed in the selected period"
        query={topCustomers}
        valueLabel="Orders"
      />
    </>
  );
}
