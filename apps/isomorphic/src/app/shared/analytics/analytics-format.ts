'use client';

import { useMemo } from 'react';
import { useStoreSettings } from '@/hooks/queries/useStoreSettings';

/**
 * Value formatting for analytics charts.
 *
 * Two formatters per chart, not one, because an axis tick and a tooltip are
 * answering different questions. A tick has to fit in the gutter and only needs
 * to give the reader a scale — `₦12.9M`. A tooltip is what the reader opened to
 * get the actual figure, so it stays exact — `₦12,914,513`. Feeding one full
 * formatter to both is what pushed `10000000` past the axis gutter and left it
 * rendering as `0000000`, which is not a smaller number but a wrong one.
 *
 * The locale is pinned rather than left to the browser: `en-GB` compacts to
 * `12.9m` and `1.3bn` where `en-NG` gives `12.9M` and `1.3B`, so an admin abroad
 * would see different axis labels from the same data.
 */

const LOCALE = 'en-NG';

/** Exact, to the naira. Fractions are noise on a figure this size. */
export const formatMoney = (value: number, currency = 'NGN'): string =>
  new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

/** Scale only, for axis ticks — `₦12.9M`. */
export const formatMoneyCompact = (value: number, currency = 'NGN'): string =>
  new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

/** Scale only, for counts — `12.9K`. */
export const formatCountCompact = (value: number): string =>
  new Intl.NumberFormat(LOCALE, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export interface ChartValueFormat {
  /** Tooltips and any exact readout. */
  valueFormatter: (value: number) => string;
  /** Axis ticks, which have a gutter to fit inside. */
  axisFormatter: (value: number) => string;
}

/**
 * Money formatters bound to the store's configured currency.
 *
 * Spread onto a chart: `<AnalyticsBreakdownChart {...money} />`. Currency comes
 * from settings for the same reason the stat cards read it there — a naira
 * figure rendered with a dollar sign is worse than an unformatted one.
 */
export const useMoneyFormat = (): ChartValueFormat => {
  const { data: settings } = useStoreSettings();
  const currency = settings?.currency || 'NGN';

  return useMemo(
    () => ({
      valueFormatter: (value: number) => formatMoney(value, currency),
      axisFormatter: (value: number) => formatMoneyCompact(value, currency),
    }),
    [currency]
  );
};
