'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';
import { PaginationMeta } from '@/types/content.types';
import {
  PickupLocation,
  StockAlert,
  StockAlertSummaryRow,
  Ticket,
  TicketListFilters,
  TicketListMeta,
  TicketSummary,
} from '@/types/support.types';

export const supportKeys = {
  tickets: (filters?: TicketListFilters) => ['support', 'tickets', filters ?? {}] as const,
  ticket: (id: string) => ['support', 'ticket', id] as const,
  stockAlerts: (page: number, limit: number) => ['support', 'stock-alerts', page, limit] as const,
  stockAlertsForProduct: (productId: string) => ['support', 'stock-alerts', 'product', productId] as const,
  pickupLocations: ['pickup-locations'] as const,
};

export const useTickets = (filters: TicketListFilters) =>
  useQuery<{ items: TicketSummary[]; meta?: TicketListMeta }>({
    queryKey: supportKeys.tickets(filters),
    queryFn: async () => {
      const response = await apiClient.getWithMeta<TicketSummary[], TicketListMeta>(api.support.tickets, {
        params: {
          status: filters.status || undefined,
          search: filters.search || undefined,
          page: filters.page,
          limit: filters.limit,
        },
      });
      return { items: response.data ?? [], meta: response.meta };
    },
    placeholderData: (previous) => previous,
    refetchInterval: 60 * 1000,
  });

export const useTicket = (id: string) =>
  useQuery<Ticket>({
    queryKey: supportKeys.ticket(id),
    queryFn: async () => {
      const response = await apiClient.get<Ticket>(api.support.ticket(id));
      if (!response.data) throw new Error('Ticket not found');
      return response.data;
    },
    enabled: !!id,
  });

export const useStockAlertSummary = (page: number, limit: number) =>
  useQuery<{ items: StockAlertSummaryRow[]; meta?: PaginationMeta }>({
    queryKey: supportKeys.stockAlerts(page, limit),
    queryFn: async () => {
      const response = await apiClient.getWithMeta<StockAlertSummaryRow[], PaginationMeta>(api.support.stockAlerts, {
        params: { page, limit },
      });
      return { items: response.data ?? [], meta: response.meta };
    },
    placeholderData: (previous) => previous,
  });

export const useStockAlertsForProduct = (productId: string | null) =>
  useQuery<StockAlert[]>({
    queryKey: supportKeys.stockAlertsForProduct(productId ?? ''),
    queryFn: async () => {
      const response = await apiClient.get<StockAlert[]>(api.support.stockAlertsForProduct(productId!));
      return response.data ?? [];
    },
    enabled: !!productId,
  });

export const usePickupLocations = () =>
  useQuery<PickupLocation[]>({
    queryKey: supportKeys.pickupLocations,
    queryFn: async () => {
      const response = await apiClient.get<PickupLocation[]>(api.pickupLocations.list);
      return response.data ?? [];
    },
  });
