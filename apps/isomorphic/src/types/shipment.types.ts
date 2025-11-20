// Shipment Management Types

// Shipment status enum
export type ShipmentStatus =
  | 'In-Warehouse'
  | 'Shipped'
  | 'In-Transit'
  | 'Dispatched'
  | 'Delivered'
  | 'Returned'
  | 'Failed';

// Shipping address interface
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Dimensions interface
export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
}

// Tracking history entry
export interface TrackingHistoryEntry {
  _id?: string;
  location?: string;
  timestamp: Date | string;
  description?: string;
}

// Order reference (when populated)
export interface OrderRef {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  customerInfo?: {
    name: string;
    email: string;
  };
}

// Main shipment interface
export interface Shipment {
  _id: string;
  orderId: string | OrderRef;
  trackingNumber: string;
  courier: string;
  courierUser: string;
  status: ShipmentStatus;
  estimatedDelivery?: Date | string;
  actualDelivery?: Date | string;
  shippingAddress: ShippingAddress;
  dimensions?: Dimensions;
  cost: number;
  notes?: string;
  trackingHistory: TrackingHistoryEntry[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// List response
export interface ShipmentListResponse {
  shipments: Shipment[];
  total: number;
  page: number;
  limit: number;
}

// Create shipment input
export interface CreateShipmentInput {
  orderId: string;
  courier: string;
  shippingAddress: ShippingAddress;
  estimatedDelivery?: string;
  dimensions?: Dimensions;
  cost: number;
  notes?: string;
}

// Update shipment input
export interface UpdateShipmentInput {
  courier?: string;
  shippingAddress?: Partial<ShippingAddress>;
  estimatedDelivery?: string;
  actualDelivery?: string;
  dimensions?: Dimensions;
  cost?: number;
  notes?: string;
  status?: ShipmentStatus;
}

// Status update input
export interface UpdateStatusInput {
  status: ShipmentStatus;
  note?: string;
}

// Tracking update input
export interface AddTrackingInput {
  status: ShipmentStatus;
  location: string;
  description: string;
  timestamp?: string;
}

// Bulk update input
export interface BulkUpdateStatusInput {
  shipmentIds: string[];
  status: ShipmentStatus;
  note?: string;
}

// Tracking response (public)
export interface TrackingResponse {
  trackingNumber: string;
  status: ShipmentStatus;
  estimatedDelivery?: Date | string;
  trackingHistory: TrackingHistoryEntry[];
}

// Filter options
export interface ShipmentFilters {
  status?: ShipmentStatus;
  page?: number;
  limit?: number;
  search?: string; // For frontend search (tracking number, courier)
}

// Status badge configuration
export interface StatusBadgeConfig {
  label: string;
  color: 'warning' | 'info' | 'secondary' | 'success' | 'danger' | 'primary';
  variant?: 'solid' | 'flat' | 'outline';
}

// Status options for dropdowns
export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'In-Warehouse',
  'In-Transit',
  'Shipped',
  'Dispatched',
  'Delivered',
  'Returned',
  'Failed',
];

// Status badge mapping
export const STATUS_BADGE_CONFIG: Record<ShipmentStatus, StatusBadgeConfig> = {
  'In-Warehouse': { label: 'In Warehouse', color: 'warning', variant: 'flat' },
  'In-Transit': { label: 'In Transit', color: 'primary', variant: 'flat' },
  Shipped: { label: 'Shipped', color: 'info', variant: 'flat' },
  Dispatched: { label: 'Dispatched', color: 'secondary', variant: 'flat' },
  Delivered: { label: 'Delivered', color: 'success', variant: 'flat' },
  Returned: { label: 'Returned', color: 'danger', variant: 'outline' },
  Failed: { label: 'Failed', color: 'danger', variant: 'solid' },
};
