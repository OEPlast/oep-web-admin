/**
 * Response of `/admin/analytics/products/:id/performance`.
 *
 * Mirrors `ProductPerformanceResult` on the server. This endpoint sits outside
 * the metric registry — see the header of `analytics/productPerformance.ts` for
 * which definitions it duplicates on purpose and why.
 */

export interface ProductAnalyticsProduct {
  id: string;
  name: string;
  sku: number | null;
  slug: string | null;
  image: string | null;
  price: number | null;
  stock: number | null;
  lowStockThreshold: number | null;
  createdAt: string | null;
}

export interface ProductAnalyticsTotals {
  revenue: number;
  unitsSold: number;
  ordersContaining: number;
  /** Realised average line price — revenue / units, not the list price. */
  averageSellingPrice: number | null;
  reviews: number;
  averageRating: number | null;
  wishlistAdds: number;
  cartAdds: number;
}

export interface ProductAnalyticsSeriesRow {
  bucket: string;
  bucketLabel: string;
  bucketStart: string;
  revenue: number;
  unitsSold: number;
}

/** Already a percentage, 0–100. Do not multiply by 100 again. */
export interface ProductAnalyticsDistributionRow {
  key: string;
  label: string;
  value: number;
  share: number | null;
}

export interface ProductAnalyticsResponse {
  product: ProductAnalyticsProduct;
  granularity: string;
  timezone: string;
  from: string;
  to: string;
  totals: ProductAnalyticsTotals;
  comparison: {
    from: string;
    to: string;
    totals: Record<string, number | null>;
    changePct: Record<string, number | null>;
  } | null;
  series: ProductAnalyticsSeriesRow[];
  ratings: ProductAnalyticsDistributionRow[];
  orderStatuses: ProductAnalyticsDistributionRow[];
  computedAt: string;
}
