'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AnalyticsRange } from '@/types/analytics-query.types';

/**
 * Shared analytics date range.
 *
 * Replaces the block every analytics page used to re-implement: two independent
 * `<DatePicker>`s, two `useState`s, and a `dateParams` object literal rebuilt on
 * every render and then embedded directly in a React Query key. That last part
 * was the real defect — the key changed identity on each render and only React
 * Query's structural hashing kept it from refetching in a loop.
 *
 * ## Dates cross the wire date-only, on purpose
 *
 * `toISOString()` would send an instant (`2026-07-04T23:00:00.000Z`), which the
 * server can only interpret as that exact moment. Sending `2026-07-04` lets the
 * engine resolve the day boundary **in the store's timezone** — midnight Lagos
 * for `from`, end-of-day Lagos for `to`. Picking "4 July" therefore means 4 July
 * in the business's own day, not in whatever zone the admin's laptop is set to.
 */

/**
 * The default window: the past six months to date.
 *
 * `setMonth` with a negative result rolls the year back correctly, and it clamps
 * end-of-month overflow — 31 August minus six months is 28/29 February, not an
 * invalid 31 February.
 */
const DEFAULT_MONTHS_BACK = 6;

const defaultFrom = (): Date => {
  const from = new Date();
  from.setMonth(from.getMonth() - DEFAULT_MONTHS_BACK);
  return from;
};

/** `yyyy-MM-dd` in the browser's own calendar, which is what the user picked. */
const toDateOnly = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const plural = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? '' : 's'}`;

/**
 * `date` plus `count` months, clamped to the end of the target month.
 *
 * Plain `setMonth` overflows instead of clamping — 31 January plus one month
 * gives 3 March, not 28 February — and that overflow is what makes a naive
 * month subtraction produce negative leftover days.
 */
const addMonths = (date: Date, count: number): Date => {
  const shifted = new Date(date.getFullYear(), date.getMonth() + count, 1);
  const lastDay = new Date(shifted.getFullYear(), shifted.getMonth() + 1, 0).getDate();
  shifted.setDate(Math.min(date.getDate(), lastDay));
  return shifted;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The window as a spoken length — "9 months and 7 days".
 *
 * Counted in calendar units rather than by dividing a millisecond span: months
 * are not 30 days and years are not 365, so a span-based figure drifts by days
 * over a multi-year window and reads as wrong to anyone who checks it against
 * the dates.
 *
 * Whole months are taken first and the remainder measured from the resulting
 * anchor date, rather than subtracting each field and borrowing. Borrowing
 * cannot express 31 January → 1 March: one month lands on 28 February, so the
 * leftover is 1 day, but a borrow can only take February's 28 days against a
 * 31-day start and lands on **-2**.
 */
const describeSpan = (from: Date, to: Date): string => {
  // Compared date-only, matching how the range crosses the wire. A window is a
  // set of whole days in the store's calendar, not an elapsed instant.
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  if (end < start) return '';

  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  // The month arithmetic can overshoot by one when the end day precedes the
  // start day within the month; step back so the anchor never passes the end.
  if (addMonths(start, totalMonths) > end) totalMonths -= 1;

  const anchor = addMonths(start, totalMonths);
  // Rounded because a DST boundary makes a calendar day 23 or 25 hours long.
  const days = Math.round((end.getTime() - anchor.getTime()) / DAY_MS);

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts = [
    years && plural(years, 'year'),
    months && plural(months, 'month'),
    days && plural(days, 'day'),
  ].filter(Boolean) as string[];

  // Both ends on the same day: the window still covers that whole day, because
  // the engine resolves `to` to end-of-day in the store timezone.
  if (parts.length === 0) return '1 day';
  if (parts.length === 1) return parts[0];

  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};

export interface UseAnalyticsRangeResult {
  /** Pass straight into `useSeries` / `useSummary` / `useBreakdown`. */
  range: AnalyticsRange;
  /** The applied window. */
  from: Date;
  to: Date;
  /**
   * What the calendar should highlight, which is not always the applied window:
   * mid-selection it is the pending start with no end yet.
   */
  pickerStart: Date;
  pickerEnd: Date | null;
  setRange: (from: Date | null, to: Date | null) => void;
  /**
   * How long the window is, in words — "9 months and 7 days".
   *
   * Deliberately not a second rendering of the dates: the picker input already
   * shows those, and repeating them next to it told the operator nothing they
   * were not already looking at.
   */
  duration: string;
}

export const useAnalyticsRange = (
  options?: {
    /**
     * Opening start date, when six months back is the wrong question.
     *
     * A single product is the case this exists for: its whole sales history is
     * usually the point, and a six-month window silently hides the launch. Only
     * the *initial* value — once the operator picks a range, this is not
     * reapplied.
     */
    defaultFrom?: Date;
  }
): UseAnalyticsRangeResult => {
  // Lazy initialiser, so a caller passing `new Date(...)` inline does not reset
  // the window on every render.
  const [from, setFrom] = useState<Date>(() => options?.defaultFrom ?? defaultFrom());
  const [to, setTo] = useState<Date>(() => new Date());
  // Held separately from the applied range so a half-finished selection can be
  // shown in the calendar without querying an open-ended window.
  const [pendingFrom, setPendingFrom] = useState<Date | null>(null);

  const setRange = useCallback((nextFrom: Date | null, nextTo: Date | null) => {
    if (nextFrom && nextTo) {
      setFrom(nextFrom);
      setTo(nextTo);
      setPendingFrom(null);
      return;
    }

    // First click of a range: remember it so the calendar can highlight it, but
    // leave the applied window alone until the second click lands.
    setPendingFrom(nextFrom);
  }, []);

  // Memoised so the object identity is stable across renders — the query key
  // depends on it.
  const range = useMemo<AnalyticsRange>(
    () => ({ from: toDateOnly(from), to: toDateOnly(to) }),
    [from, to]
  );

  const duration = useMemo(() => describeSpan(from, to), [from, to]);

  return {
    range,
    from,
    to,
    // Mid-selection the calendar tracks the pending start with an open end, so
    // the first click is visible without querying a half-open window.
    pickerStart: pendingFrom ?? from,
    pickerEnd: pendingFrom ? null : to,
    setRange,
    duration,
  };
};
