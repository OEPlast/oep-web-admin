"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/libs/axios";
import api from "@/libs/endpoints";

export interface CourierUser {
  _id: string;
  name: string;
  email: string;
}

const EMPTY: readonly CourierUser[] = [] as const;

export const useCouriers = (params?: { search?: string }) => {
  return useQuery<readonly CourierUser[]>({
    queryKey: ["couriers", params ?? {}],
    queryFn: async () => {
      const response = await apiClient.get<CourierUser[] >(api.users.couriers, {
        params,
      });
      return (response.data ?? []) as CourierUser[];
    },
    placeholderData: EMPTY,
    staleTime: 5 * 60 * 1000,
  });
};
