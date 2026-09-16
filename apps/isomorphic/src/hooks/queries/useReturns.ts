'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

/** A line of a return, as Main-server stores it (models/Return.ts). `product` is populated. */
export interface ReturnItem {
  product: {
    _id: string;
    name: string;
    slug?: string;
    price?: number;
    description_images?: Array<{ url?: string; cover_image?: boolean }>;
  } | null;
  qty: number;
  reason: string;
  reasonDetails?: string;
  images?: string[];
  refundAmount?: number;
}

export type ReturnStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'items_received'
  | 'inspecting'
  | 'inspection_passed'
  | 'inspection_failed'
  | 'completed'
  | 'cancelled';

export interface ReturnRefundTransaction {
  _id: string;
  reference: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentGateway: string;
  createdAt?: string;
}

/**
 * A return as the admin API returns it. This used to describe a shape (`customer`, `reason`,
 * `items[].productName`) that the backend never produced, so the returns screens rendered
 * undefined everywhere.
 */
export interface Return {
  _id: string;
  returnNumber: string;
  order: {
    _id: string;
    orderNumber?: string;
    total: number;
    createdAt: string;
    deliveredAt?: string;
  };
  user: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string;
  };
  items: ReturnItem[];
  type: 'refund' | 'exchange';
  status: ReturnStatus;
  totalRefundAmount: number | null;
  refundTransaction?: ReturnRefundTransaction | string | null;
  customerNotes?: string;
  adminNotes?: string;
  requestedAt: string;
  statusHistory?: Array<{ status: ReturnStatus; at: string; by: string; note?: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnsFilters {
  status?: string;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReturnsResponse {
  data: Return[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useReturns = (filters: ReturnsFilters = {}) => {
  return useQuery<ReturnsResponse>({
    queryKey: ['returns', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const response = await apiClient.get<ReturnsResponse>(`${api.returns.list}?${params}`);
      return response.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useReturnById = (id: string) => {
  return useQuery<Return>({
    queryKey: ['return', id],
    queryFn: async () => {
      const response = await apiClient.get<Return>(api.returns.byId(id));
      return response.data!;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
