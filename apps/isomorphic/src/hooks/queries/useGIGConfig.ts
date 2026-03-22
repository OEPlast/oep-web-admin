'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

export interface GIGConfigData {
  _id: string;
  senderName: string;
  senderPhoneNumber: string;
  senderAddress: string;
  senderLocality: string;
  senderStationId: number;
  senderLatitude: number;
  senderLongitude: number;
  senderCountryCode: string;
  customerCode: string;
  customerType: string;
  vehicleType: string;
  defaultDeliveryOptionIds: number[];
  defaultPickUpOptions: string;
  enabledDeliveryMethods: Array<'shipping' | 'pickup' | 'gig'>;
  shippingDiscountAmountOff: number;
  gigDiscountAmountOff: number;
  freeShippingThreshold: number | null;
  shippingMinDeliveryDays: number;
  shippingMaxDeliveryDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GIGStation {
  StationId: number;
  StateName: string;
  StationName: string;
  StationCode: string;
}

export const useGIGConfig = () => {
  return useQuery<GIGConfigData | null>({
    queryKey: ['gigConfig'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<GIGConfigData>(api.gig.config);
        return response.data ?? null;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // No config has been created yet — not an error
          return null;
        }
        throw error;
      }
    },
    retry: 1,
  });
};

export const useGIGStations = (enabled = true) => {
  return useQuery<GIGStation[]>({
    queryKey: ['gigStations'],
    queryFn: async () => {
      const response = await apiClient.get<GIGStation[]>(api.gig.stations);
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
