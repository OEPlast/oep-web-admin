'use client';

import { StatusHistory } from '@/types/order.types';
import { Text, Avatar } from 'rizzui';
import { getCdnUrl } from '@core/utils/cdn-url';

interface OrderTimelineProps {
  statusHistory: StatusHistory[];
}

export default function OrderTimeline({ statusHistory }: OrderTimelineProps) {
  return (
    <div className="mb-6">
      <Text className="mb-3 font-semibold">Order Timeline</Text>
      <div className="space-y-4">
        {statusHistory.map((history, index) => (
          <div key={index} className="flex gap-3">
            <Avatar
              src={getCdnUrl(history.updatedBy?.avatar) || ''}
              name={`${history.updatedBy?.firstName || ''} ${history.updatedBy?.lastName || ''}`}
              size="sm"
            />
            <div className="flex-1">
              <Text className="font-medium capitalize">{history.status}</Text>
              <Text className="text-sm text-gray-600">
                {new Date(history.updatedAt).toLocaleString()}{' '}
                by {history.updatedBy?.firstName} {history.updatedBy?.lastName}
              </Text>
              {history.notes && (
                <Text className="mt-1 text-sm text-gray-700">{history.notes}</Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
