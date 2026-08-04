'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  PiCurrencyNgnDuotone,
  PiShoppingCartDuotone,
  PiPackageDuotone,
  PiStarDuotone,
  PiHeartDuotone,
  PiBasketDuotone,
  PiTagDuotone,
  PiArrowLeftDuotone,
  PiPencilSimpleDuotone,
} from 'react-icons/pi';
import { Badge, Button, Text, Title } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import { getCdnUrl } from '@core/utils/cdn-url';
import PageHeader from '@/app/shared/page-header';
import AnalyticsRangePicker from '@/app/shared/analytics/analytics-range-picker';
import { useMoneyFormat, formatCountCompact } from '@/app/shared/analytics/analytics-format';
import { AnalyticsError } from '@/app/shared/analytics/analytics-states';
import { useAnalyticsRange } from '@/hooks/useAnalyticsRange';
import { useProductAnalytics } from '@/hooks/queries/analytics';
import { routes } from '@/config/routes';
import SkuPrompt from './components/sku-prompt';
import ProductPerformanceCharts from './components/performance-charts';

/**
 * Opening window for a product, rather than the six-months-back default.
 *
 * A product page is usually opened to ask "how has this sold", and a rolling
 * six months answers a narrower question — anything launched before that shows
 * a truncated history with no hint that it is truncated. Module-level so the
 * reference is stable across renders.
 */
const PERFORMANCE_START = new Date(2025, 0, 1);

/**
 * One product's analytics, composed.
 *
 * The product is carried in the URL (`?product=<id>`) rather than in state, so
 * the page is linkable — which is the whole point of the entry points that lead
 * here from the products table and the edit form. Opened without one, it asks
 * for a SKU and rewrites the URL once resolved, so a prompted visit ends up as
 * shareable as a linked one.
 */
export default function ProductPerformanceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = useAnalyticsRange({ defaultFrom: PERFORMANCE_START });
  const money = useMoneyFormat();

  const productIdFromUrl = searchParams.get('product');
  const [productId, setProductId] = useState<string | null>(productIdFromUrl);

  const query = useProductAnalytics(productId, {
    ...range.range,
    granularity: 'auto',
  });

  const handleResolved = useCallback(
    (product: { id: string }) => {
      setProductId(product.id);
      // `replace`, not `push`: the prompt is not a step worth going Back to.
      router.replace(routes.productPerformance(product.id));
    },
    [router]
  );

  const { data, isLoading, isError, error } = query;
  const product = data?.product;

  return (
    <>
      <SkuPrompt open={!productId} onResolved={handleResolved} />

      <PageHeader
        title={product?.name ?? 'Product Performance'}
        breadcrumb={[
          { href: '/', name: 'Home' },
          { href: routes.analytics, name: 'Analytics' },
          { href: '/analytics/products', name: 'Products' },
          { name: product?.name ?? 'Performance' },
        ]}
      >
        <div className="flex items-center gap-3">
          <Link href="/analytics/products">
            <Button variant="outline" className="gap-2">
              <PiArrowLeftDuotone className="h-4 w-4" />
              All products
            </Button>
          </Link>
          {product && (
            <Link href={routes.eCommerce.ediProduct(product.id)}>
              <Button variant="outline" className="gap-2">
                <PiPencilSimpleDuotone className="h-4 w-4" />
                Edit product
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {/* Nothing below is meaningful until a product is chosen. */}
      {!productId ? null : isError ? (
        <WidgetCard title="Product performance">
          <AnalyticsError error={error} />
        </WidgetCard>
      ) : (
        <>
          <AnalyticsRangePicker range={range} />

          <ProductIdentityCard
            product={product}
            isLoading={isLoading}
            formatMoney={money.valueFormatter}
          />

          <StatGrid
            totals={data?.totals}
            changePct={data?.comparison?.changePct}
            isLoading={isLoading}
            formatMoney={money.valueFormatter}
          />

          <ProductPerformanceCharts
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            money={money}
          />
        </>
      )}
    </>
  );
}

/** The product itself — what is being measured, stated before the measurements. */
function ProductIdentityCard({
  product,
  isLoading,
  formatMoney,
}: {
  product?: {
    id: string;
    name: string;
    sku: number | null;
    image: string | null;
    price: number | null;
    stock: number | null;
    lowStockThreshold: number | null;
  };
  isLoading: boolean;
  formatMoney: (value: number) => string;
}) {
  if (isLoading || !product) {
    return <div className="mb-6 h-[104px] animate-pulse rounded-lg bg-gray-100" />;
  }

  // Stock state is "as of now" and ignores the selected period — the same
  // distinction the summary cards draw for stock metrics.
  const outOfStock = (product.stock ?? 0) <= 0;
  const lowStock =
    !outOfStock &&
    product.lowStockThreshold != null &&
    (product.stock ?? 0) <= product.lowStockThreshold;

  return (
    <WidgetCard title="" className="mb-6 p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {product.image ? (
            <img
              src={getCdnUrl(product.image)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PiPackageDuotone className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="min-w-[200px] flex-1">
          <Title as="h3" className="text-base font-semibold">
            {product.name}
          </Title>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <PiTagDuotone className="h-4 w-4" />
              SKU {product.sku ?? '—'}
            </span>
            {product.price != null && <span>List {formatMoney(product.price)}</span>}
            <span>
              Stock {product.stock ?? 0}
              <Text as="span" className="ms-1 text-xs text-gray-400">
                as of now
              </Text>
            </span>
          </div>
        </div>

        {outOfStock ? (
          <Badge color="danger" variant="flat">
            Out of stock
          </Badge>
        ) : lowStock ? (
          <Badge color="warning" variant="flat">
            Low stock
          </Badge>
        ) : (
          <Badge color="success" variant="flat">
            In stock
          </Badge>
        )}
      </div>
    </WidgetCard>
  );
}

function StatGrid({
  totals,
  changePct,
  isLoading,
  formatMoney,
}: {
  totals?: {
    revenue: number;
    unitsSold: number;
    ordersContaining: number;
    averageSellingPrice: number | null;
    reviews: number;
    averageRating: number | null;
    wishlistAdds: number;
    cartAdds: number;
  };
  changePct?: Record<string, number | null>;
  isLoading: boolean;
  formatMoney: (value: number) => string;
}) {
  if (isLoading || !totals) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-[110px] animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Revenue',
      value: formatMoney(totals.revenue),
      icon: PiCurrencyNgnDuotone,
      change: changePct?.revenue,
      hint: 'Paid orders only, measured on the line — this product’s price x quantity, not the whole order total.',
    },
    {
      label: 'Units Sold',
      value: formatCountCompact(totals.unitsSold),
      icon: PiPackageDuotone,
      change: changePct?.unitsSold,
    },
    {
      label: 'Orders',
      value: formatCountCompact(totals.ordersContaining),
      icon: PiShoppingCartDuotone,
      change: changePct?.ordersContaining,
      hint: 'Paid orders containing this product. An order listing it twice counts once.',
    },
    {
      label: 'Avg Selling Price',
      value: totals.averageSellingPrice != null ? formatMoney(totals.averageSellingPrice) : '—',
      icon: PiTagDuotone,
      hint: 'Revenue divided by units — what it actually sold for, which is not the list price once discounts land.',
    },
    {
      label: 'Reviews',
      value: formatCountCompact(totals.reviews),
      icon: PiStarDuotone,
      change: changePct?.reviews,
      hint: 'Approved reviews written in this period, matching what the storefront shows.',
    },
    {
      label: 'Avg Rating',
      value: totals.averageRating != null ? totals.averageRating.toFixed(2) : '—',
      icon: PiStarDuotone,
      hint: 'Null rather than zero when nobody reviewed it — unrated is not the same as rated badly.',
    },
    {
      label: 'Wishlist Adds',
      value: formatCountCompact(totals.wishlistAdds),
      icon: PiHeartDuotone,
    },
    {
      label: 'Carts',
      value: formatCountCompact(totals.cartAdds),
      icon: PiBasketDuotone,
      hint: 'Carts created in this period that contain this product.',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <WidgetCard key={card.label} title="" className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <Text className="text-sm text-gray-500">{card.label}</Text>
                <Title as="h3" className="mt-1 text-xl font-semibold">
                  {card.value}
                </Title>
                {card.change !== undefined && (
                  <Text
                    className={cn(
                      'mt-1 text-xs',
                      card.change === null
                        ? 'text-gray-400'
                        : card.change >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                    )}
                  >
                    {/* A null baseline is stated, not drawn as 0%. */}
                    {card.change === null
                      ? 'no prior-period data'
                      : `${card.change >= 0 ? '+' : ''}${card.change}% vs previous period`}
                  </Text>
                )}
                {card.hint && (
                  <Text className="mt-1 text-xs text-gray-400">{card.hint}</Text>
                )}
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </WidgetCard>
        );
      })}
    </div>
  );
}
