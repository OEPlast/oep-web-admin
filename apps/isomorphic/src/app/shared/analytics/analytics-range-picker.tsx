'use client';

import { Text } from 'rizzui';
import { DatePicker } from '@core/ui/datepicker';
import cn from '@core/utils/class-names';
import type { UseAnalyticsRangeResult } from '@/hooks/useAnalyticsRange';

/**
 * Shared analytics date-range picker.
 *
 * One control: pick a start and an end. Month and year dropdowns make long jumps
 * possible without arrowing back a month at a time — reaching 2021 that way would
 * be roughly 60 clicks.
 *
 * The dates are sent to the server **date-only**, so the day boundary is
 * resolved in the store's timezone rather than the browser's. See
 * `useAnalyticsRange`.
 */

/**
 * Ten years back, matching the engine's `MAX_SPAN_MS`.
 *
 * Module-level so the reference is stable across renders — a fresh `Date` each
 * render would give react-datepicker a changing `minDate` prop.
 */
const YEARS_SELECTABLE = 10;

const EARLIEST = (() => {
  const earliest = new Date();
  earliest.setFullYear(earliest.getFullYear() - YEARS_SELECTABLE);
  return earliest;
})();

export default function AnalyticsRangePicker({
  range,
  className,
}: {
  range: UseAnalyticsRangeResult;
  className?: string;
}) {
  return (
    <div className={cn('mb-6', className)}>
      <Text className="mb-2 text-sm font-medium">Period</Text>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <DatePicker
          selected={range.pickerStart}
          startDate={range.pickerStart}
          endDate={range.pickerEnd ?? undefined}
          onChange={(dates) => {
            const [from, to] = Array.isArray(dates) ? dates : [dates, null];
            range.setRange(from, to);
          }}
          selectsRange
          maxDate={new Date()}
          /**
           * Floor the range at ten years, matching the engine's own `MAX_SPAN_MS`.
           *
           * Without it the UI happily offers a window the API rejects with a 400,
           * and the year dropdown has no lower bound to render from.
           */
          minDate={EARLIEST}

          monthsShown={1}
          // Jump years and months directly instead of arrowing through them.
          // `dropdownMode` is omitted from v8's DatePickerProps type but is still
          // read at runtime (`props.dropdownMode ?? "scroll"`), and "select"
          // gives real dropdowns rather than a scroll list.
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          // The year list defaults to 5 entries, which would not reach data from
          // 2021. Sized to the selectable window instead.
          yearDropdownItemNumber={YEARS_SELECTABLE + 1}
          /**
           * Render the calendar in a portal on `document.body`.
           *
           * This is the actual fix for the popup being cut off: it renders inline
           * by default, so any ancestor with `overflow: hidden` clips it — which
           * is why "July" appeared as "ly" with its first columns missing. No
           * setup needed for the id; react-datepicker's Portal creates the node
           * and appends it to body when it does not already exist.
           */
          portalId="analytics-range-picker-portal"
          dateFormat="dd MMM yyyy"
          placeholderText="Select a date range"
          className="w-full sm:w-auto"
          inputProps={{ inputClassName: 'min-w-[240px]' }}
        />

        <Text className="text-xs text-gray-500">{range.duration}</Text>
      </div>
    </div>
  );
}
