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

export interface GIGShipmentSummary {
  orderId: string;
  gigWaybill: string;
  receiverName: string;
  receiverAddress: string;
  internalStatus: string | null;
  createdAt: string;
}

export interface GIGShipmentsPaginatedResponse {
  data: GIGShipmentSummary[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const useGIGShipments = (page = 1, limit = 20) => {
  return useQuery<GIGShipmentsPaginatedResponse>({
    queryKey: ['gigShipments', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<GIGShipmentsPaginatedResponse>(
        `${api.gig.shipments}?page=${page}&limit=${limit}`
      );
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

export interface GIGPreshipmentDetail {
  PreShipmentMobileId: number;
  Waybill: string;
  SenderName: string;
  SenderPhoneNumber: string;
  ReceiverName: string;
  ReceiverPhoneNumber: string;
  ReceiverAddress: string;
  SenderAddress: string;
  IsHomeDelivery: boolean;
  GrandTotal: number;
  DeliveryPrice: number;
  VehicleType: string;
  shipmentstatus: string;
  IsCancelled: boolean;
  IsDelivered: boolean;
  DateCreated: string;
  DateModified: string;
  WaybillImageUrl?: string;
}

export interface GIGShipmentInfoResponse {
  gigTracking: GIGPreshipmentDetail[] | null;
  order: Record<string, unknown> | null;
  shipment: {
    status: string;
    trackingHistory: Array<{ location: string; timestamp: string; description: string }>;
    estimatedDelivery?: string;
    deliveredOn?: string;
  } | null;
}

export const useGIGShipmentInfo = (waybill: string) => {
  return useQuery<GIGShipmentInfoResponse>({
    queryKey: ['gigShipmentInfo', waybill],
    queryFn: async () => {
      const response = await apiClient.get<GIGShipmentInfoResponse>(
        api.gig.shipmentInfo(waybill)
      );
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    enabled: !!waybill,
    staleTime: 30 * 1000,
  });
};
