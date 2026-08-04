'use client';

import { Text } from 'rizzui';
import { PiWarningCircleDuotone, PiInfoDuotone } from 'react-icons/pi';
import { handleApiError } from '@/libs/axios';

/**
 * Empty and error states for analytics widgets.
 *
 * Neither existed anywhere in the analytics tree before: `error` was never
 * destructured from any React Query result, so a failed request rendered the
 * same "No data available" as a genuinely quiet week. Those are different facts
 * and an operator needs to tell them apart.
 */

export function AnalyticsError({ error }: { error: unknown }) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
      <PiWarningCircleDuotone className="h-8 w-8 text-red-500" />
      <Text className="font-medium">Could not load this data</Text>
      <Text className="max-w-sm text-sm text-gray-500">
        {handleApiError(error)}
      </Text>
    </div>
  );
}

export function AnalyticsEmpty({
  message = 'No activity in the selected period',
}: {
  message?: string;
}) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
      <Text className="text-gray-500">{message}</Text>
    </div>
  );
}
