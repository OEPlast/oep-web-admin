/**
 * Order Type Definitions
 * Complete TypeScript interfaces for Orders Management
 */

// Order Item Interface
export interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    image?: string;
    coverImage?: string;
    sku?: string;
  };
  variant?: {
    size?: string;
    color?: string;
    material?: string;
  };
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
}

// Shipping Address Interface
export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Status History Interface
export interface StatusHistory {
  status: OrderStatus;
  updatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  updatedAt: string;
  notes?: string;
}

// Payment Details Interface
export interface PaymentDetails {
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

// Order Status Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod =
  | 'card'
  | 'paypal'
  | 'bank_transfer'
  | 'cash_on_delivery';

export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup';

// Main Order Interface
export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  items: OrderItem[];

  // Pricing
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;

  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails: PaymentDetails;

  // Shipping
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  carrier?: string;

  // Status
  status: OrderStatus;
  statusHistory: StatusHistory[];

  // Discounts
  coupon?: {
    _id: string;
    code: string;
    discount: number;
  };
  sale?: {
    _id: string;
    title: string;
    type: string;
  };

  // Notes
  notes?: string;
  internalNotes?: string;
  cancellationReason?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

// API Response Types
export interface OrdersListResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats?: {
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
  };
}

export interface OrderByIdResponse {
  success: boolean;
  data: Order;
}

export interface OrderStatisticsResponse {
  success: boolean;
  data: {
    totalOrders: number;
    todayOrders: number;
    weekOrders: number;
    monthOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByPaymentStatus: Record<PaymentStatus, number>;
    topCustomers: Array<{
      userId: string;
      name: string;
      email: string;
      orderCount: number;
      totalSpent: number;
    }>;
  };
}

// Query Params
export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  shippingMethod?: ShippingMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'total' | 'status' | 'customerName';
  sortOrder?: 'asc' | 'desc';
}

// Mutation Inputs
export interface UpdateOrderStatusInput {
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
  notifyCustomer?: boolean;
}

export interface UpdatePaymentStatusInput {
  paymentStatus: PaymentStatus;
  transactionId?: string;
  notifyCustomer?: boolean;
}

export interface UpdateTrackingInput {
  trackingNumber: string;
  carrier: string;
  notifyCustomer?: boolean;
}

export interface ProcessRefundInput {
  amount: number;
  reason: string;
  refundShipping?: boolean;
  restoreInventory?: boolean;
  notifyCustomer?: boolean;
}

export interface CancelOrderInput {
  reason: string;
  restoreInventory?: boolean;
  notifyCustomer?: boolean;
}

export interface UpdateNotesInput {
  internalNotes: string;
}
