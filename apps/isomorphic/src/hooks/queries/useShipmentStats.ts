"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/axios";
import api from "@/libs/endpoints";

export type ShipmentStatus =
  | "In-Warehouse"
  | "Shipped"
  | "In-Transit"
  | "Dispatched"
  | "Delivered"
  | "Returned"
  | "Failed";

export type ShipmentStats = Record<ShipmentStatus | "total", number>;

const EMPTY: ShipmentStats = {
  "In-Warehouse": 0,
  "In-Transit": 0,
  Shipped: 0,
  Dispatched: 0,
  Delivered: 0,
  Returned: 0,
  Failed: 0,
  total: 0,
};

export const useShipmentStats = () => {
  return useQuery<ShipmentStats>({
    queryKey: ["shipment-stats"],
    queryFn: async () => {
      const response = await apiClient.get<{ message: string; data: ShipmentStats }>(api.shipment.statistics);
      return (response.data ?? EMPTY) as ShipmentStats;
    },
    placeholderData: EMPTY,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
