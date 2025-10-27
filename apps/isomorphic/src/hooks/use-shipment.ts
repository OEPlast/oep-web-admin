import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/libs/axios';
import { api } from '@/libs/endpoints';
import type {
  Shipment,
  ShipmentListResponse,
  CreateShipmentInput,
  UpdateShipmentInput,
  UpdateStatusInput,
  AddTrackingInput,
  BulkUpdateStatusInput,
  TrackingResponse,
  ShipmentFilters,
} from '@/types/shipment.types';

// Query keys factory
const shipmentKeys = {
  all: ['shipments'] as const,
  lists: () => [...shipmentKeys.all, 'list'] as const,
  list: (filters: ShipmentFilters) =>
    [...shipmentKeys.lists(), filters] as const,
  details: () => [...shipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  tracking: (id: string) => [...shipmentKeys.all, 'tracking', id] as const,
  byStatus: (status: string, page: number) =>
    [...shipmentKeys.all, 'status', status, page] as const,
  publicTracking: (trackingNumber: string) =>
    ['tracking', trackingNumber] as const,
};

/**
 * 1. Get all shipments with filters (Admin)
 */
export const useShipments = (filters: ShipmentFilters = {}) => {
  const { page = 1, limit = 20, status } = filters;

  return useQuery({
    queryKey: shipmentKeys.list(filters),
    queryFn: async (): Promise<ShipmentListResponse> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await apiClient.get(
        `${api.shipment.list}?${params.toString()}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * 2. Get shipment by ID (Admin)
 */
export const useShipment = (shipmentId: string) => {
  return useQuery({
    queryKey: shipmentKeys.detail(shipmentId),
    queryFn: async (): Promise<Shipment> => {
      const response = await apiClient.get(api.shipment.byId(shipmentId));
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    enabled: !!shipmentId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 3. Get shipment tracking history (Admin)
 */
export const useShipmentTracking = (shipmentId: string) => {
  return useQuery({
    queryKey: shipmentKeys.tracking(shipmentId),
    queryFn: async (): Promise<TrackingResponse> => {
      const response = await apiClient.get(api.shipment.tracking(shipmentId));
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    enabled: !!shipmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes (tracking updates frequently)
  });
};

/**
 * 4. Get shipments by status (Admin)
 */
export const useShipmentsByStatus = (status: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: shipmentKeys.byStatus(status, page),
    queryFn: async (): Promise<ShipmentListResponse> => {
      const response = await apiClient.get(
        `${api.shipment.byStatus(status)}?page=${page}&limit=${limit}`
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 5. Public tracking (no auth required)
 */
export const usePublicTracking = (trackingNumber: string) => {
  return useQuery({
    queryKey: shipmentKeys.publicTracking(trackingNumber),
    queryFn: async (): Promise<TrackingResponse> => {
      const response = await apiClient.get(
        api.shipment.publicTracking(trackingNumber)
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    enabled: !!trackingNumber && trackingNumber.length > 5,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * 6. Create shipment (Admin)
 */
export const useCreateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateShipmentInput): Promise<Shipment> => {
      const response = await apiClient.post(api.shipment.create, data);
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success('Shipment created successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to create shipment'
      );
    },
  });
};

/**
 * 7. Update shipment (Admin)
 */
export const useUpdateShipment = (shipmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateShipmentInput): Promise<Shipment> => {
      const response = await apiClient.put(
        api.shipment.update(shipmentId),
        data
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success('Shipment updated successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update shipment'
      );
    },
  });
};

/**
 * 8. Delete shipment (Admin)
 */
export const useDeleteShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipmentId: string): Promise<void> => {
      await apiClient.delete(api.shipment.delete(shipmentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success('Shipment deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete shipment'
      );
    },
  });
};

/**
 * 9. Update shipment status (Admin)
 */
export const useUpdateShipmentStatus = (shipmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStatusInput): Promise<Shipment> => {
      const response = await apiClient.patch(
        api.shipment.updateStatus(shipmentId),
        data
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.tracking(shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success('Status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });
};

/**
 * 10. Add tracking update (Admin)
 */
export const useAddTrackingUpdate = (shipmentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddTrackingInput): Promise<Shipment> => {
      const response = await apiClient.post(
        api.shipment.addTracking(shipmentId),
        data
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.tracking(shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success('Tracking update added successfully!');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to add tracking update'
      );
    },
  });
};

/**
 * 11. Bulk update status (Admin)
 */
export const useBulkUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: BulkUpdateStatusInput
    ): Promise<{ updatedCount: number }> => {
      const response = await apiClient.post(
        api.shipment.bulkUpdateStatus,
        data
      );
      if (!response.data) {
        throw new Error('No data returned');
      }
      return response.data;    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      toast.success(`${data.updatedCount} shipment(s) updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to bulk update shipments'
      );
    },
  });
};
