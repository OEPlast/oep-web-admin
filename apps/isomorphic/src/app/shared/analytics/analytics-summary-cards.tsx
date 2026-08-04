'use client';

import type { IconType } from 'react-icons';
import { PiInfoDuotone } from 'react-icons/pi';
import { Text, Title, Tooltip } from 'rizzui';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import { formatNumber } from '@core/utils/format-number';
import { useStoreSettings } from '@/hooks/queries/useStoreSettings';
import type { SummaryResponse } from '@/types/analytics-query.types';
import { AnalyticsError } from './analytics-states';

/**
 * Stat cards driven by the query engine.
 *
 * Replaces seven near-identical bespoke `*-overview-cards` components. Beyond
 * deduplication, it fixes two things those could not express:
 *
 *   - **Stock figures are labelled as such.** `total_products` ignores the date
 *     range by definition, so showing it beside a period selector without saying
 *     so implies a filter that is not being applied.
 *   - **A null delta is rendered as "no prior data", not "0%".** Growth from a
 *     zero baseline is not flat, and the old cards drew it as flat.
 */

export type CardFormat = 'number' | 'currency' | 'decimal';

export interface SummaryCardSpec {
  metric: string;
  label: string;
  icon: IconType;
  iconClassName?: string;
  format?: CardFormat;
  /** Marks a value that deliberately ignores the selected period. */
  isStock?: boolean;
  /** Computes a value from other totals instead of reading its own metric. */
  derive?: (totals: Record<string, number | null>) => number | null;
  hint?: string;
}

/**
 * Money is formatted in the store's own currency.
 *
 * `@core/utils/to-currency` hardcodes USD, so a naira figure would render with a
 * dollar sign — a 20% revenue correction is hard enough to explain without the
 * unit also being wrong. NGN is the fallback rather than USD because the store
 * transacts in naira; the Settings default of 'USD' is a template leftover.
 */
const formatValue = (
  value: number | null,
  format: CardFormat = 'number',
  currency = 'NGN'
): string => {
  if (value === null || value === undefined) return '—';

  if (format === 'currency') {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (format === 'decimal') return value.toFixed(2);
  return formatNumber(value);
};

export default function AnalyticsSummaryCards({
  cards,
  query,
  className,
}: {
  cards: SummaryCardSpec[];
  query: { data?: SummaryResponse; isLoading: boolean; isError: boolean; error: unknown };
  className?: string;
}) {
  const { data, isLoading, isError, error } = query;
  const { data: settings } = useStoreSettings();
  const currency = settings?.currency || 'NGN';

  if (isError) {
    return (
      <WidgetCard title="Overview" className={className}>
        <AnalyticsError error={error} />
      </WidgetCard>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4', className)}>
        {cards.map((card) => (
          <div key={card.metric} className="h-[110px] animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  const totals = data?.totals ?? {};
  const changes = data?.comparison?.changePct ?? {};

  return (
    <div className={cn('grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {cards.map((card) => {
        const value = card.derive ? card.derive(totals) : (totals[card.metric] ?? null);
        const change = card.metric in changes ? changes[card.metric] : undefined;
        const Icon = card.icon;

        return (
          <WidgetCard key={card.metric} title="" className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <Text className="text-sm text-gray-500">{card.label}</Text>
                  {(card.isStock || card.hint) && (
                    <Tooltip
                      size="sm"
                      content={
                        card.hint ??
                        'A current total — this figure is as of now and does not change with the selected period.'
                      }
                      placement="top"
                    >
                      <span>
                        <PiInfoDuotone className="h-3.5 w-3.5 text-gray-400" />
                      </span>
                    </Tooltip>
                  )}
                </div>
                <Title as="h3" className="mt-1 text-xl font-semibold">
                  {formatValue(value, card.format, currency)}
                </Title>

                {change !== undefined && (
                  <Text
                    className={cn(
                      'mt-1 text-xs',
                      change === null
                        ? 'text-gray-400'
                        : change >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                    )}
                  >
                    {/* A null baseline is stated, not silently drawn as 0%. */}
                    {change === null
                      ? 'no prior-period data'
                      : `${change >= 0 ? '+' : ''}${change}% vs previous period`}
                  </Text>
                )}

                {card.isStock && (
                  <Text className="mt-1 text-xs text-gray-400">as of now</Text>
                )}
              </div>

              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100',
                  card.iconClassName
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </WidgetCard>
        );
      })}
    </div>
  );
}
