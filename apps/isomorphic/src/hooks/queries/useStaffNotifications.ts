'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

export interface StaffNotification {
  id: string;
  kind: 'order' | 'return' | 'transaction' | 'inventory';
  title: string;
  detail?: string;
  at: string;
  href: string;
}

export interface StaffNotificationSummary {
  counts: {
    ordersToFulfil: number;
    pendingReturns: number;
    transactionsForReview: number;
    lowStock: number;
  };
  items: StaffNotification[];
  generatedAt: string;
}

/** What needs staff attention, polled every minute for the notification bell. */
export function useStaffNotifications() {
  return useQuery<StaffNotificationSummary>({
    queryKey: ['staff-notifications'],
    queryFn: async () => {
      const response = await apiClient.get<StaffNotificationSummary>(api.notifications.summary);
      if (!response.data) throw new Error('Invalid notification response');
      return response.data;
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}
