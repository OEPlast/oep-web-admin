"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/axios";
import api from "@/libs/endpoints";
import type { Shipment, ShipmentListResponse } from "@/types/shipment.types";

export type DeliveryStatus =
  | "In-Warehouse"
  | "In-Transit"
  | "Shipped"
  | "Dispatched"
  | "Delivered"
  | "Returned"
  | "Failed";

export interface DeliveryFilters {
  status?: DeliveryStatus;
  page?: number;
  limit?: number;
}

export type DeliveryStats = Record<DeliveryStatus | "total", number>;

const EMPTY_STATS: DeliveryStats = {
  "In-Warehouse": 0,
  "In-Transit": 0,
  Shipped: 0,
  Dispatched: 0,
  Delivered: 0,
  Returned: 0,
  Failed: 0,
  total: 0,
};

const deliveryKeys = {
  all: ["deliveries"] as const,
  list: (filters: DeliveryFilters) => [...deliveryKeys.all, "list", filters] as const,
  detail: (id: string) => [...deliveryKeys.all, "detail", id] as const,
  stats: () => [...deliveryKeys.all, "stats"] as const,
};

export const useMyDeliveries = (filters: DeliveryFilters = {}) => {
  const { page = 1, limit = 20, status } = filters;

  return useQuery<ShipmentListResponse>({
    queryKey: deliveryKeys.list({ page, limit, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (status) params.append("status", status);

      const response = await apiClient.get<ShipmentListResponse>(`${api.delivery.mine}?${params.toString()}`);
      return response.data!;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: { shipments: [], total: 0, page: 1, limit: limit ?? 20 },
  });
};

export const useMyDeliveryStats = () => {
  return useQuery<DeliveryStats>({
    queryKey: deliveryKeys.stats(),
    queryFn: async () => {
      const response = await apiClient.get<{ message: string; data: DeliveryStats }>(api.delivery.mineStats);
      return (response.data ?? EMPTY_STATS) as DeliveryStats;
    },
    placeholderData: EMPTY_STATS,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useDeliveryById = (id: string) => {
  return useQuery<Shipment>({
    queryKey: deliveryKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Shipment>(api.delivery.byId(id));
      return response.data!;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeliveryByTrackingNumber = (trackingNumber: string) => {
  return useQuery<Shipment>({
    queryKey: deliveryKeys.detail(trackingNumber),
    queryFn: async () => {
      const response = await apiClient.get<Shipment>(api.delivery.byTracking(trackingNumber));
      return response.data!;
    },
    enabled: !!trackingNumber,
    staleTime: 5 * 60 * 1000,
  });
};



export default deliveryKeys;
