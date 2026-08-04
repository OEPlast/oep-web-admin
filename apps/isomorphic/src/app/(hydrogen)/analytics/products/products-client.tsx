/**
 * Products Analytics Client Component
 *
 * Displays comprehensive product analytics including:
 * - Overview metrics (total products, stock status)
 * - Top products by revenue
 * - Category performance comparison
 * - Product performance table
 * - Most wishlisted and reviewed products
 */

'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import {
  PiPackageDuotone,
  PiPlusCircleDuotone,
  PiWarningDuotone,
  PiProhibitDuotone,
} from 'react-icons/pi';
import { useProductPerformance, useSummary, useBreakdown } from '@/hooks/queries/analytics';
import AnalyticsBreakdownChart from '@/app/shared/analytics/analytics-breakdown-chart';
import { useMoneyFormat } from '@/app/shared/analytics/analytics-format';
import AnalyticsBreakdownTable from '@/app/shared/analytics/analytics-breakdown-table';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import AnalyticsSummaryCards from '@/app/shared/analytics/analytics-summary-cards';
import ProductPerformanceTable from './components/product-performance-table';

const pageHeader = {
  title: 'Products Analytics',
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
      name: 'Products',
    },
  ],
};

export default function ProductsAnalyticsClient() {
  const range = useAnalyticsRange();
  const money = useMoneyFormat();

  // Table pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');

  const summary = useSummary({
    metrics: ['products_added', 'total_products', 'low_stock_products', 'out_of_stock_products'],
    ...range.range,
    compare: 'previous',
  });

  const dateParams = {
    from: summary.data?.from ?? new Date(Date.now() - 30 * 864e5).toISOString(),
    to: summary.data?.to ?? new Date().toISOString(),
  };

  const topProducts = useBreakdown({
    metric: 'revenue',
    dimension: 'product',
    ...range.range,
    limit: 10,
  });

  const categories = useBreakdown({
    metric: 'revenue',
    dimension: 'category',
    ...range.range,
    limit: 10,
  });

  const wishlisted = useBreakdown({
    metric: 'wishlist_adds',
    dimension: 'wishlist_product',
    ...range.range,
    limit: 10,
  });

  const reviewed = useBreakdown({
    metric: 'reviews_written',
    dimension: 'review_product',
    ...range.range,
    limit: 10,
  });
  const { data: performance, isLoading: loadingPerformance } =
    useProductPerformance({
      // Spread the range: without it this table silently reported all-time
      // figures beside date-filtered widgets.
      ...dateParams,
      page,
      limit,
      search,
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
            metric: 'total_products',
            label: 'Total Products',
            icon: PiPackageDuotone,
            isStock: true,
          },
          { metric: 'products_added', label: 'Added in Period', icon: PiPlusCircleDuotone },
          {
            metric: 'low_stock_products',
            label: 'Low Stock',
            icon: PiWarningDuotone,
            isStock: true,
            hint: "In stock but at or below the product's own reorder threshold, as of now.",
          },
          {
            metric: 'out_of_stock_products',
            label: 'Out of Stock',
            icon: PiProhibitDuotone,
            isStock: true,
          },
        ]}
      />
      {/* Charts Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 @container">
        <AnalyticsBreakdownTable
          title="Top Products by Revenue"
          query={topProducts}
          valueLabel="Revenue"
          valueFormatter={money.valueFormatter}
        />
        <AnalyticsBreakdownChart
          title="Revenue by Category"
          query={categories}
          kind="bar"
          {...money}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 @container lg:grid-cols-2">
        <AnalyticsBreakdownTable
          title="Most Wishlisted"
          query={wishlisted}
          valueLabel="Adds"
        />
        <AnalyticsBreakdownTable
          title="Most Reviewed"
          query={reviewed}
          valueLabel="Reviews"
        />
      </div>

      {/* Product Performance Table */}
      <ProductPerformanceTable
        data={performance}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={(newLimit: number) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onSearchChange={(newSearch: string) => {
          setSearch(newSearch);
          setPage(1); // Reset to first page on search
        }}
        isLoading={loadingPerformance}
      />
    </>
  );
}
