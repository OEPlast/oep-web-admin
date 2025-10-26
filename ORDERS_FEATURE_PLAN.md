# Orders Management Feature - Implementation Plan (API Integration)

## Feature Request

**Goal**: Connect the existing Orders UI components with real backend API endpoints using apiClient and TypeScript for complete type safety. Remove all dummy data dependencies and implement full CRUD operations with React Query.

**Current State**: 
- Existing UI components in `/app/shared/ecommerce/order/` (OrdersTable, OrderFilters, OrderDetailsDrawer, etc.)
- Empty component files that need implementation
- Existing order-list components using dummy data from `@/data/order-data`
- No API integration - all components use static/dummy data

**Target State**:
- All components connected to backend API via apiClient
- Type-safe API calls with TypeScript interfaces
- React Query for data fetching, caching, and mutations
- No dummy data - all data from real API endpoints
- Proper loading states, error handling, and optimistic updates

---

## Backend Schema References

### Order Model
```typescript
{
  _id: ObjectId,
  orderNumber: string, // Unique order identifier (e.g., "ORD-20250125-001")
  user: ObjectId, // Reference to User
  items: [{
    product: ObjectId, // Reference to Product
    variant: {
      size?: string,
      color?: string,
      material?: string,
    },
    quantity: number,
    price: number, // Price at time of purchase
    discount: number, // Discount applied
    subtotal: number, // quantity * (price - discount)
  }],
  
  // Pricing breakdown
  subtotal: number,
  shippingCost: number,
  tax: number,
  discount: number, // From coupons/sales
  total: number,
  
  // Payment information
  paymentMethod: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery',
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded',
  paymentDetails: {
    transactionId?: string,
    paidAt?: Date,
    refundedAt?: Date,
    refundAmount?: number,
  },
  
  // Shipping information
  shippingAddress: {
    fullName: string,
    phone: string,
    addressLine1: string,
    addressLine2?: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
  },
  shippingMethod: 'standard' | 'express' | 'overnight' | 'pickup',
  trackingNumber?: string,
  carrier?: string, // e.g., "FedEx", "UPS", "DHL"
  
  // Order status and tracking
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  statusHistory: [{
    status: string,
    updatedBy: ObjectId, // Staff member who updated
    updatedAt: Date,
    notes?: string,
  }],
  
  // Applied discounts
  coupon?: ObjectId, // Reference to Coupon
  sale?: ObjectId, // Reference to Sale
  
  // Additional information
  notes?: string, // Customer notes
  internalNotes?: string, // Staff-only notes
  cancellationReason?: string,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  confirmedAt?: Date,
  shippedAt?: Date,
  deliveredAt?: Date,
  cancelledAt?: Date,
}
```

---

## Requirements Checklist

### Core Functionality
- [ ] **Orders List Page** with data table showing all orders
- [ ] **Pagination** (10, 20, 50, 100 items per page)
- [ ] **Advanced Filtering**:
  - [ ] By order status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
  - [ ] By payment status (pending, paid, failed, refunded, partially_refunded)
  - [ ] By payment method (card, paypal, bank_transfer, cash_on_delivery)
  - [ ] By shipping method (standard, express, overnight, pickup)
  - [ ] By date range (order date, delivery date)
  - [ ] By price range (minimum and maximum)
- [ ] **Search Functionality**:
  - [ ] Search by order number
  - [ ] Search by customer name
  - [ ] Search by customer email
  - [ ] Search by tracking number
  - [ ] Debounced search (500ms delay)
- [ ] **Sorting**:
  - [ ] By order date (newest/oldest)
  - [ ] By total amount (high/low)
  - [ ] By status
  - [ ] By customer name
- [ ] **Bulk Actions**:
  - [ ] Update status for multiple orders
  - [ ] Export selected orders to CSV/Excel
  - [ ] Print invoices for selected orders
  - [ ] Send notification emails to customers

### Order Details & Management
- [ ] **View Order Details Drawer/Modal**:
  - [ ] Customer information (name, email, phone)
  - [ ] Order items with product images, names, quantities, prices
  - [ ] Pricing breakdown (subtotal, shipping, tax, discount, total)
  - [ ] Shipping address
  - [ ] Payment information
  - [ ] Order status timeline/history
  - [ ] Tracking information (if available)
  - [ ] Customer and internal notes
- [ ] **Update Order Status**:
  - [ ] Status dropdown with workflow validation
  - [ ] Add notes when updating status
  - [ ] Automatic email notification to customer
  - [ ] Track who made the change and when
- [ ] **Update Payment Status**:
  - [ ] Mark as paid/failed/refunded
  - [ ] Add transaction ID
  - [ ] Record payment date
- [ ] **Shipping Management**:
  - [ ] Add/update tracking number
  - [ ] Select carrier
  - [ ] Update shipping status
  - [ ] Generate shipping labels (integration ready)
- [ ] **Refund Processing**:
  - [ ] Full refund
  - [ ] Partial refund with amount input
  - [ ] Refund reason selection
  - [ ] Update inventory on refund
- [ ] **Order Cancellation**:
  - [ ] Cancel order with reason
  - [ ] Automatic inventory restoration
  - [ ] Customer notification
- [ ] **Edit Order** (limited scope):
  - [ ] Update internal notes
  - [ ] Update shipping address (before shipped)
  - [ ] Update customer contact information

### Analytics & Reporting
- [ ] **Order Statistics Dashboard**:
  - [ ] Total orders (today, this week, this month)
  - [ ] Revenue metrics (total, average order value)
  - [ ] Order status breakdown (pie chart)
  - [ ] Payment status breakdown
  - [ ] Popular shipping methods
  - [ ] Top customers by order volume
- [ ] **Export & Reports**:
  - [ ] Export orders to CSV/Excel
  - [ ] Generate PDF invoices
  - [ ] Generate packing slips
  - [ ] Sales reports by date range
  - [ ] Revenue reports with filters

### UI/UX Features
- [ ] **Responsive Design**:
  - [ ] Mobile-friendly table with horizontal scroll
  - [ ] Collapsible filters on mobile
  - [ ] Touch-friendly action buttons
- [ ] **Status Badges**:
  - [ ] Color-coded status indicators (pending: yellow, confirmed: blue, shipped: purple, delivered: green, cancelled: red, refunded: gray)
  - [ ] Payment status badges
  - [ ] Shipping status badges
- [ ] **Quick Actions**:
  - [ ] View details (eye icon)
  - [ ] Edit order (pencil icon)
  - [ ] Print invoice (printer icon)
  - [ ] Track shipment (truck icon)
  - [ ] More actions menu (ellipsis)
- [ ] **Real-time Updates**:
  - [ ] Auto-refresh orders list (optional, every 30s)
  - [ ] Toast notifications for status changes
  - [ ] Loading states during actions
- [ ] **Empty States**:
  - [ ] No orders found illustration
  - [ ] No search results message
  - [ ] Clear filters button

---

## Special Requirements

### Status Workflow Validation
- Enforce valid status transitions:
  - `pending` → `confirmed` → `processing` → `shipped` → `delivered`
  - `pending`/`confirmed`/`processing` → `cancelled`
  - `delivered` → `refunded`
- Prevent invalid transitions (e.g., `shipped` → `pending`)
- Show warning if trying invalid transition

### Inventory Integration
- Reduce product stock when order is confirmed
- Restore stock when order is cancelled or refunded
- Show low stock warnings in order details
- Prevent orders if product out of stock

### Notification System
- Send email to customer on:
  - Order confirmation
  - Order shipped (with tracking link)
  - Order delivered
  - Order cancelled
  - Refund processed
- Send admin notifications for:
  - New orders
  - Failed payments
  - Cancellation requests

### Payment Integration
- Support multiple payment gateways (Stripe, PayPal, etc.)
- Handle payment webhooks
- Validate payment status
- Process refunds through gateway API
- Store transaction references

### Shipping Integration (Future-ready)
- Integration points for shipping APIs (FedEx, UPS, DHL)
- Rate calculation
- Label generation
- Tracking updates
- Delivery confirmation

### Permissions & Access Control
- Different views for different roles:
  - Admin: Full access to all orders and actions
  - Manager: View and update orders, process refunds
  - Staff: View orders and update status
  - Support: View orders only, add notes
- Audit log for all order changes
- Track who performed each action

---

## Backend Extensions Required

### New Endpoints Needed

```typescript
// Order Management
GET    /admin/orders                          // List all orders with filters
GET    /admin/orders/list                     // Minimal list for dropdowns
GET    /admin/orders/:id                      // Get order details (populated)
PUT    /admin/orders/:id/status               // Update order status
PUT    /admin/orders/:id/payment-status       // Update payment status
PUT    /admin/orders/:id/tracking             // Add/update tracking info
POST   /admin/orders/:id/refund               // Process refund
PUT    /admin/orders/:id/cancel               // Cancel order
PUT    /admin/orders/:id/notes                // Update internal notes
POST   /admin/orders/:id/resend-notification  // Resend customer email
GET    /admin/orders/:id/invoice              // Generate invoice PDF
GET    /admin/orders/:id/packing-slip         // Generate packing slip
POST   /admin/orders/bulk-update              // Bulk status update
POST   /admin/orders/export                   // Export orders to CSV/Excel

// Order Analytics
GET    /admin/orders/analytics                // Order analytics dashboard
GET    /admin/orders/statistics               // Order statistics (counts, revenue)
GET    /admin/orders/revenue                  // Revenue by date range
GET    /admin/orders/top-customers            // Top customers by orders

// Order History
GET    /admin/orders/:id/history              // Status change history
GET    /admin/orders/:id/timeline             // Visual timeline of order events
```

### Request/Response Examples

**GET /admin/orders (List with filters)**
```typescript
Query params: {
  page?: number,
  limit?: number,
  search?: string, // Order number, customer name/email, tracking
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded',
  paymentMethod?: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery',
  shippingMethod?: 'standard' | 'express' | 'overnight' | 'pickup',
  startDate?: string, // ISO date
  endDate?: string,
  minAmount?: number,
  maxAmount?: number,
  sortBy?: 'createdAt' | 'total' | 'status' | 'customerName',
  sortOrder?: 'asc' | 'desc',
}

Response: {
  success: true,
  data: Order[], // Populated with user, items.product
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
  },
  stats?: {
    totalRevenue: number,
    averageOrderValue: number,
    ordersByStatus: { pending: 5, confirmed: 10, ... },
  }
}
```

**PUT /admin/orders/:id/status**
```typescript
Request body: {
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  notes?: string,
  trackingNumber?: string, // If status is 'shipped'
  carrier?: string,
  notifyCustomer?: boolean, // Default: true
}

Response: {
  success: true,
  data: Order, // Updated order
  message: "Order status updated successfully"
}
```

**POST /admin/orders/:id/refund**
```typescript
Request body: {
  amount: number, // For partial refund
  reason: string,
  refundShipping?: boolean,
  restoreInventory?: boolean, // Default: true
  notifyCustomer?: boolean, // Default: true
}

Response: {
  success: true,
  data: {
    order: Order,
    refundTransaction: {
      transactionId: string,
      amount: number,
      processedAt: Date,
    }
  },
  message: "Refund processed successfully"
}
```

### Validation Rules
- Order number must be unique
- Status transitions must follow workflow
- Refund amount cannot exceed order total
- Cannot ship without shipping address
- Cannot mark as delivered without tracking number (optional but recommended)
- Payment status 'paid' required before shipping (configurable)

### Error Handling
- Handle invalid status transitions gracefully
- Validate inventory availability before confirmation
- Handle payment gateway failures
- Retry failed email notifications
- Log all errors for admin review

---

## Frontend Implementation Plan

### Phase 1: Type Definitions & API Setup

#### 1.1 Create TypeScript Interfaces (`/src/types/order.types.ts`)

```typescript
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

export type ShippingMethod = 
  | 'standard' 
  | 'express' 
  | 'overnight' 
  | 'pickup';

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
```

#### 1.2 Update Endpoints (`/src/libs/endpoints.ts`)

```typescript
// Add to existing api object
orders: {
  list: '/admin/orders',                     // List with filters & pagination
  byId: (id: string) => `/admin/orders/${id}`, // Get single order with full data
  updateStatus: (id: string) => `/admin/orders/${id}/status`,
  updatePaymentStatus: (id: string) => `/admin/orders/${id}/payment-status`,
  updateTracking: (id: string) => `/admin/orders/${id}/tracking`,
  updateNotes: (id: string) => `/admin/orders/${id}/notes`,
  refund: (id: string) => `/admin/orders/${id}/refund`,
  cancel: (id: string) => `/admin/orders/${id}/cancel`,
  resendNotification: (id: string) => `/admin/orders/${id}/resend-notification`,
  statistics: '/admin/orders/statistics',
  bulkUpdate: '/admin/orders/bulk-update',
  export: '/admin/orders/export',
},
```

---

### Phase 2: React Query Hooks

#### 2.1 Query Hooks (`/src/hooks/queries/useOrders.ts`)

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/api-client';
import api from '@/libs/endpoints';
import type { 
  OrdersListResponse, 
  OrderByIdResponse, 
  OrderStatisticsResponse,
  OrdersQueryParams 
} from '@/types/order.types';

// Fetch orders list with filters
export function useOrders(
  params?: OrdersQueryParams,
  options?: Omit<UseQueryOptions<OrdersListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<OrdersListResponse>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await apiClient.get<OrdersListResponse>(
        api.orders.list,
        { params }
      );
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

// Fetch single order by ID
export function useOrderById(
  orderId: string,
  options?: Omit<UseQueryOptions<OrderByIdResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<OrderByIdResponse>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await apiClient.get<OrderByIdResponse>(
        api.orders.byId(orderId)
      );
      return response.data;
    },
    enabled: !!orderId,
    ...options,
  });
}

// Fetch order statistics
export function useOrderStatistics(
  options?: Omit<UseQueryOptions<OrderStatisticsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<OrderStatisticsResponse>({
    queryKey: ['orderStatistics'],
    queryFn: async () => {
      const response = await apiClient.get<OrderStatisticsResponse>(
        api.orders.statistics
      );
      return response.data;
    },
    staleTime: 60000, // 1 minute
    ...options,
  });
}
```

#### 2.2 Mutation Hooks (`/src/hooks/mutations/useOrderMutations.ts`)

```typescript
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/libs/api-client';
import api from '@/libs/endpoints';
import type {
  Order,
  UpdateOrderStatusInput,
  UpdatePaymentStatusInput,
  UpdateTrackingInput,
  ProcessRefundInput,
  CancelOrderInput,
  UpdateNotesInput,
} from '@/types/order.types';
import { toast } from 'react-hot-toast';

// Update Order Status
export function useUpdateOrderStatus(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdateOrderStatusInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdateOrderStatusInput }) => {
      const response = await apiClient.put(
        api.orders.updateStatus(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
      toast.success('Order status updated successfully');
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error) => {
      toast.error('Failed to update order status');
      options?.onError?.(error, undefined as any, undefined);
    },
  });
}

// Update Payment Status
export function useUpdatePaymentStatus(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdatePaymentStatusInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdatePaymentStatusInput }) => {
      const response = await apiClient.put(
        api.orders.updatePaymentStatus(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Payment status updated successfully');
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error) => {
      toast.error('Failed to update payment status');
      options?.onError?.(error, undefined as any, undefined);
    },
  });
}

// Update Tracking Information
export function useUpdateTracking(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdateTrackingInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdateTrackingInput }) => {
      const response = await apiClient.put(
        api.orders.updateTracking(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Tracking information updated successfully');
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error) => {
      toast.error('Failed to update tracking information');
      options?.onError?.(error, undefined as any, undefined);
    },
  });
}

// Process Refund
export function useProcessRefund(
  options?: UseMutationOptions<
    { success: boolean; data: Order; refundTransaction: any },
    Error,
    { orderId: string; data: ProcessRefundInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: ProcessRefundInput }) => {
      const response = await apiClient.post(
        api.orders.refund(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
      toast.success('Refund processed successfully');
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error) => {
      toast.error('Failed to process refund');
      options?.onError?.(error, undefined as any, undefined);
    },
  });
}

// Cancel Order
export function useCancelOrder(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: CancelOrderInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: CancelOrderInput }) => {
      const response = await apiClient.put(
        api.orders.cancel(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
      toast.success('Order cancelled successfully');
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error) => {
      toast.error('Failed to cancel order');
      options?.onError?.(error, undefined as any, undefined);
    },
  });
}

// Update Internal Notes
export function useUpdateOrderNotes(
  options?: UseMutationOptions<
    { success: boolean; data: Order },
    Error,
    { orderId: string; data: UpdateNotesInput }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: UpdateNotesInput }) => {
      const response = await apiClient.put(
        api.orders.updateNotes(orderId),
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Notes updated successfully');
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error) => {
      toast.error('Failed to update notes');
      options?.onError?.(error, undefined as any, undefined);
    },
  });
}
```

---

### Phase 3: Validation Schemas (`/src/validators/order-schemas.ts`)

```typescript
import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notifyCustomer: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.status === 'shipped' && !data.trackingNumber) {
      return false;
    }
    return true;
  },
  { 
    message: 'Tracking number is required when marking order as shipped',
    path: ['trackingNumber'],
  }
);

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']),
  transactionId: z.string().optional(),
  notifyCustomer: z.boolean().default(true),
});

export const updateTrackingSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  carrier: z.string().min(1, 'Carrier is required'),
  notifyCustomer: z.boolean().default(true),
});

export const processRefundSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  reason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
  refundShipping: z.boolean().default(false),
  restoreInventory: z.boolean().default(true),
  notifyCustomer: z.boolean().default(true),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(10, 'Please provide a cancellation reason (minimum 10 characters)'),
  restoreInventory: z.boolean().default(true),
  notifyCustomer: z.boolean().default(true),
});

export const updateNotesSchema = z.object({
  internalNotes: z.string().min(1, 'Notes cannot be empty'),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type UpdateTrackingInput = z.infer<typeof updateTrackingSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type UpdateNotesInput = z.infer<typeof updateNotesSchema>;
```

---

### Phase 4: Component Implementation

#### 4.1 Main Orders Page (`/src/app/shared/ecommerce/order/OrdersPage.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/queries/useOrders';
import { Order, OrdersQueryParams, OrderStatus, PaymentStatus } from '@/types/order.types';
import OrdersTable from './OrdersTable';
import OrderFilters from './OrderFilters';
import OrderDetailsDrawer from './OrderDetailsDrawer';
import { Loader, Text } from 'rizzui';

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [queryParams, setQueryParams] = useState<OrdersQueryParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error } = useOrders(queryParams);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  const handleFilterChange = (newParams: Partial<OrdersQueryParams>) => {
    setQueryParams((prev) => ({
      ...prev,
      ...newParams,
      page: 1, // Reset to page 1 when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader variant="spinner" size="xl" />
        <Text className="ml-3 text-gray-600">Loading orders...</Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <Text className="text-red-500">
          Error loading orders: {error?.message || 'Unknown error'}
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrderFilters
        currentParams={queryParams}
        onChange={handleFilterChange}
      />

      <OrdersTable
        orders={data?.data || []}
        pagination={data?.pagination}
        onViewOrder={handleViewOrder}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}
```

#### 4.2 Orders Table Component (`/src/app/shared/ecommerce/order/OrdersTable.tsx`)

```typescript
'use client';

import { Order } from '@/types/order.types';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { ordersColumns } from './columns';

interface OrdersTableProps {
  orders: Order[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onViewOrder: (order: Order) => void;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function OrdersTable({
  orders,
  pagination,
  onViewOrder,
  onPageChange,
  isLoading = false,
}: OrdersTableProps) {
  const { table, setData } = useTanStackTable<Order>({
    tableData: orders,
    columnConfig: ordersColumns(onViewOrder),
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: pagination?.limit || 10,
        },
      },
      manualPagination: true, // Using server-side pagination
      pageCount: pagination?.totalPages || 1,
      enableColumnResizing: false,
    },
  });

  return (
    <div>
      <Table
        table={table}
        variant="modern"
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      {pagination && (
        <TablePagination
          table={table}
          className="py-4"
          total={pagination.total}
          pageSize={pagination.limit}
          current={pagination.page}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
```

#### 4.3 Table Columns (`/src/app/shared/ecommerce/order/columns.tsx`)

```typescript
'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Order } from '@/types/order.types';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import TableAvatar from '@core/ui/avatar-card';
import DateCell from '@core/ui/date-cell';
import { ActionIcon, Text } from 'rizzui';
import { PiEyeBold } from 'react-icons/pi';
import { formatCurrency } from '@/utils/format';
import { getCdnUrl } from '@/utils/get-cdn-url';

const columnHelper = createColumnHelper<Order>();

export const ordersColumns = (onViewOrder: (order: Order) => void) => [
  columnHelper.display({
    id: 'orderNumber',
    size: 140,
    header: 'Order #',
    cell: ({ row }) => (
      <Text className="font-medium">#{row.original.orderNumber}</Text>
    ),
  }),
  
  columnHelper.accessor('user', {
    id: 'customer',
    size: 250,
    header: 'Customer',
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <TableAvatar
          src={getCdnUrl(user.avatar) || ''}
          name={`${user.firstName} ${user.lastName}`}
          description={user.email}
        />
      );
    },
  }),

  columnHelper.accessor('items', {
    id: 'items',
    size: 100,
    header: 'Items',
    cell: ({ row }) => (
      <Text>{row.original.items.length} item(s)</Text>
    ),
  }),

  columnHelper.accessor('total', {
    id: 'total',
    size: 120,
    header: 'Total',
    cell: ({ row }) => (
      <Text className="font-semibold">
        {formatCurrency(row.original.total)}
      </Text>
    ),
  }),

  columnHelper.accessor('paymentStatus', {
    id: 'paymentStatus',
    size: 140,
    header: 'Payment',
    cell: ({ row }) => (
      <PaymentStatusBadge status={row.original.paymentStatus} />
    ),
  }),

  columnHelper.accessor('status', {
    id: 'status',
    size: 140,
    header: 'Status',
    cell: ({ row }) => (
      <OrderStatusBadge status={row.original.status} />
    ),
  }),

  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 180,
    header: 'Order Date',
    cell: ({ row }) => <DateCell date={new Date(row.original.createdAt)} />,
  }),

  columnHelper.display({
    id: 'actions',
    size: 80,
    header: 'Actions',
    cell: ({ row }) => (
      <ActionIcon
        size="sm"
        variant="outline"
        onClick={() => onViewOrder(row.original)}
      >
        <PiEyeBold className="h-4 w-4" />
      </ActionIcon>
    ),
  }),
];
```

---

### Phase 5: Status Badge Components

#### OrderStatusBadge.tsx
```typescript
'use client';

import { Badge } from 'rizzui';
import { OrderStatus } from '@/types/order.types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; color: any }> = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'info' },
  processing: { label: 'Processing', color: 'secondary' },
  shipped: { label: 'Shipped', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  refunded: { label: 'Refunded', color: 'secondary' },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="flat" color={config.color} size="sm">
      {config.label}
    </Badge>
  );
}
```

#### PaymentStatusBadge.tsx
```typescript
'use client';

import { Badge } from 'rizzui';
import { PaymentStatus } from '@/types/order.types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

const statusConfig: Record<PaymentStatus, { label: string; color: any }> = {
  pending: { label: 'Pending', color: 'warning' },
  paid: { label: 'Paid', color: 'success' },
  failed: { label: 'Failed', color: 'danger' },
  refunded: { label: 'Refunded', color: 'secondary' },
  partially_refunded: { label: 'Partial Refund', color: 'warning' },
};

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="flat" color={config.color} size="sm">
      {config.label}
    </Badge>
  );
}
```

---

### Phase 6: Filters Component

#### OrderFilters.tsx (Simplified)
```typescript
'use client';

import { useState } from 'react';
import { OrdersQueryParams } from '@/types/order.types';
import { Input, Select, Button } from 'rizzui';
import { PiMagnifyingGlassBold, PiTrashDuotone } from 'react-icons/pi';
import { useDebounce } from '@/hooks/use-debounce';
import { useEffect } from 'react';

interface OrderFiltersProps {
  currentParams: OrdersQueryParams;
  onChange: (params: Partial<OrdersQueryParams>) => void;
}

export default function OrderFilters({ currentParams, onChange }: OrderFiltersProps) {
  const [search, setSearch] = useState(currentParams.search || '');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (debouncedSearch !== currentParams.search) {
      onChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleClearFilters = () => {
    setSearch('');
    onChange({
      search: '',
      status: undefined,
      paymentStatus: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input
        type="text"
        placeholder="Search by order#, customer, email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
        clearable
        onClear={() => setSearch('')}
        className="w-full sm:w-64"
      />

      <Select
        placeholder="Order Status"
        value={currentParams.status}
        onChange={(value) => onChange({ status: value as any })}
        options={[
          { label: 'All Statuses', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Processing', value: 'processing' },
          { label: 'Shipped', value: 'shipped' },
          { label: 'Delivered', value: 'delivered' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Refunded', value: 'refunded' },
        ]}
        className="w-40"
      />

      <Select
        placeholder="Payment Status"
        value={currentParams.paymentStatus}
        onChange={(value) => onChange({ paymentStatus: value as any })}
        options={[
          { label: 'All Payments', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Paid', value: 'paid' },
          { label: 'Failed', value: 'failed' },
          { label: 'Refunded', value: 'refunded' },
        ]}
        className="w-40"
      />

      <Button
        variant="outline"
        onClick={handleClearFilters}
        size="sm"
      >
        <PiTrashDuotone className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
```

---

### Phase 7: Order Details Drawer (uses existing layout, populated with real data)

```typescript
'use client';

import { Order } from '@/types/order.types';
import { Drawer, Text, Button } from 'rizzui';
import { useState } from 'react';
import OrderItemsList from './OrderItemsList';
import OrderPricingBreakdown from './OrderPricingBreakdown';
import ShippingAddressCard from './ShippingAddressCard';
import OrderTimeline from './OrderTimeline';
import UpdateStatusForm from './UpdateStatusForm';
import UpdateTrackingForm from './UpdateTrackingForm';
import ProcessRefundForm from './ProcessRefundForm';
import CancelOrderForm from './CancelOrderForm';
import UpdateNotesForm from './UpdateNotesForm';

interface OrderDetailsDrawerProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
}: OrderDetailsDrawerProps) {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  return (
    <>
      <Drawer isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Text className="text-2xl font-bold">Order #{order.orderNumber}</Text>
              <Text className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveForm('status')}>
                Update Status
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveForm('tracking')}>
                Add Tracking
              </Button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <Text className="mb-2 font-semibold">Customer</Text>
            <Text>{order.user.firstName} {order.user.lastName}</Text>
            <Text className="text-sm text-gray-600">{order.user.email}</Text>
          </div>

          {/* Order Items - Pass items with getCdnUrl applied */}
          <OrderItemsList items={order.items} />

          {/* Pricing */}
          <OrderPricingBreakdown order={order} />

          {/* Shipping Address */}
          <ShippingAddressCard address={order.shippingAddress} />

          {/* Timeline */}
          <OrderTimeline statusHistory={order.statusHistory} />
        </div>
      </Drawer>

      {/* Action Modals */}
      {activeForm === 'status' && (
        <UpdateStatusForm
          orderId={order._id}
          currentStatus={order.status}
          isOpen={true}
          onClose={() => setActiveForm(null)}
        />
      )}
      {/* Add other form modals similarly */}
    </>
  );
}
```

#### OrderItemsList Component (Example with getCdnUrl)

```typescript
'use client';

import { OrderItem } from '@/types/order.types';
import { Text } from 'rizzui';
import Image from 'next/image';
import { getCdnUrl } from '@/utils/get-cdn-url';
import { formatCurrency } from '@/utils/format';

interface OrderItemsListProps {
  items: OrderItem[];
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <div className="mb-6">
      <Text className="mb-3 font-semibold">Order Items</Text>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="flex items-center gap-3 rounded-lg border p-3">
            <Image
              src={getCdnUrl(item.product.coverImage || item.product.image) || '/placeholder.png'}
              alt={item.product.name}
              width={60}
              height={60}
              className="h-15 w-15 rounded-md object-cover"
            />
            <div className="flex-1">
              <Text className="font-medium">{item.product.name}</Text>
              {item.variant && (
                <Text className="text-sm text-gray-500">
                  {item.variant.size && `Size: ${item.variant.size}`}
                  {item.variant.color && ` • Color: ${item.variant.color}`}
                </Text>
              )}
              <Text className="text-sm text-gray-600">
                Qty: {item.quantity} × {formatCurrency(item.price)}
              </Text>
            </div>
            <div className="text-right">
              <Text className="font-semibold">{formatCurrency(item.subtotal)}</Text>
              {item.discount > 0 && (
                <Text className="text-sm text-green-600">
                  -{formatCurrency(item.discount)}
                </Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### OrderTimeline Component (Example with user avatars)

```typescript
'use client';

import { StatusHistory } from '@/types/order.types';
import { Text, Avatar } from 'rizzui';
import { getCdnUrl } from '@/utils/get-cdn-url';
import { formatDistance } from 'date-fns';

interface OrderTimelineProps {
  statusHistory: StatusHistory[];
}

export default function OrderTimeline({ statusHistory }: OrderTimelineProps) {
  return (
    <div className="mb-6">
      <Text className="mb-3 font-semibold">Order Timeline</Text>
      <div className="space-y-4">
        {statusHistory.map((history, index) => (
          <div key={index} className="flex gap-3">
            <Avatar
              src={getCdnUrl(history.updatedBy?.avatar) || ''}
              name={`${history.updatedBy?.firstName || ''} ${history.updatedBy?.lastName || ''}`}
              size="sm"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Text className="font-medium">{history.status}</Text>
                <Text className="text-sm text-gray-500">
                  {formatDistance(new Date(history.updatedAt), new Date(), { addSuffix: true })}
                </Text>
              </div>
              {history.updatedBy && (
                <Text className="text-sm text-gray-600">
                  by {history.updatedBy.firstName} {history.updatedBy.lastName}
                </Text>
              )}
              {history.notes && (
                <Text className="mt-1 text-sm text-gray-600">{history.notes}</Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Implementation Checklist

### Phase 1: Setup ✅
- [ ] Create `/src/types/order.types.ts` with all TypeScript interfaces
- [ ] Update `/src/libs/endpoints.ts` with orders endpoints
- [ ] Verify apiClient configuration
- [ ] Import `getCdnUrl` utility for image handling

### Phase 2: Data Layer ✅
- [ ] Create `/src/hooks/queries/useOrders.ts` with query hooks
- [ ] Create `/src/hooks/mutations/useOrderMutations.ts` with mutation hooks
- [ ] Test API connections with Postman/test environment

### Phase 3: Validation ✅
- [ ] Create `/src/validators/order-schemas.ts`
- [ ] Test all validation schemas
- [ ] Add custom validation for status workflow

### Phase 4: Core Components ✅
- [ ] Implement `OrdersPage.tsx` (main page with state management)
- [ ] Implement `OrdersTable.tsx` (table with real data)
- [ ] Implement `columns.tsx` (table columns with `getCdnUrl` for avatars)
- [ ] Replace all dummy data imports from existing components

### Phase 5: UI Components ✅
- [ ] Implement `OrderStatusBadge.tsx`
- [ ] Implement `PaymentStatusBadge.tsx`
- [ ] Implement `OrderFilters.tsx` with debounced search
- [ ] Test responsive design

### Phase 6: Details & Actions ✅
- [ ] Implement `OrderDetailsDrawer.tsx` with real data
- [ ] Implement `OrderItemsList.tsx` with `getCdnUrl` for product images
- [ ] Implement `OrderPricingBreakdown.tsx`
- [ ] Implement `ShippingAddressCard.tsx`
- [ ] Implement `OrderTimeline.tsx` with `getCdnUrl` for user avatars

### Phase 7: Action Forms ✅
- [ ] Implement `UpdateStatusForm.tsx` with validation
- [ ] Implement `UpdateTrackingForm.tsx`
- [ ] Implement `ProcessRefundForm.tsx`
- [ ] Implement `CancelOrderForm.tsx`
- [ ] Implement `UpdateNotesForm.tsx`
- [ ] Connect all forms to mutation hooks

### Phase 8: Testing & Polish ✅
- [ ] Test all CRUD operations
- [ ] Verify query invalidation works
- [ ] Test error handling and error messages
- [ ] Test loading states
- [ ] Test empty states
- [ ] Verify responsive design on mobile/tablet
- [ ] Test pagination
- [ ] Test filtering and search
- [ ] Verify all images load correctly via `getCdnUrl`
- [ ] Test image fallbacks for missing/broken images
- [ ] Accessibility audit (keyboard nav, screen readers)

---

## Image Handling with getCdnUrl

### Import Statement
```typescript
import { getCdnUrl } from '@/utils/get-cdn-url';
```

### Usage Examples

**Customer Avatar in Table:**
```typescript
<TableAvatar
  src={getCdnUrl(user.avatar) || ''}
  name={`${user.firstName} ${user.lastName}`}
  description={user.email}
/>
```

**Product Images in Order Items:**
```typescript
<Image
  src={getCdnUrl(item.product.coverImage || item.product.image) || '/placeholder.png'}
  alt={item.product.name}
  width={60}
  height={60}
  className="h-15 w-15 rounded-md object-cover"
/>
```

**User Avatars in Timeline:**
```typescript
<Avatar
  src={getCdnUrl(history.updatedBy?.avatar) || ''}
  name={`${history.updatedBy?.firstName || ''} ${history.updatedBy?.lastName || ''}`}
  size="sm"
/>
```

### Key Points
- Always use `getCdnUrl()` wrapper for ALL image URLs from backend
- Provide fallback values (empty string or placeholder) for missing images
- Use optional chaining (`?.`) for potentially undefined image properties
- Works with Next.js Image component for optimization

---

## Key Differences from Dummy Data Approach

### ❌ OLD (Dummy Data)
```typescript
import { orderData } from '@/data/order-data';

const { table, setData } = useTanStackTable({
  tableData: orderData, // Static array
  // ...
});
```

### ✅ NEW (API Integration)
```typescript
import { useOrders } from '@/hooks/queries/useOrders';

const { data, isLoading } = useOrders({
  page: 1,
  limit: 10,
  status: 'pending',
});

// Use data.data for orders array
// Use data.pagination for pagination info
```

---

## Error Handling Pattern

```typescript
const { data, isLoading, isError, error } = useOrders(params);

// In component
{isError && (
  <Alert variant="error">
    Error: {axios.isAxiosError(error) 
      ? extractBackendErrors(error).join(', ')
      : 'Failed to load orders'
    }
  </Alert>
)}
```

---

## Success Criteria

- ✅ Zero dummy data imports in production code
- ✅ All API calls use apiClient with proper types
- ✅ React Query handles caching and invalidation
- ✅ Forms use Zod validation
- ✅ Mutations show toast notifications
- ✅ Loading states for all async operations
- ✅ Error boundaries for graceful failures
- ✅ Optimistic updates where applicable
- ✅ Responsive design works on all devices
- ✅ Accessibility standards met (WCAG 2.1 AA)

---

**Next Steps**: Start with Phase 1 (Type Definitions & API Setup), then proceed sequentially through each phase.

```
src/app/admin/orders/
├── page.tsx                          // Main orders list page
├── [id]/
│   └── page.tsx                      // Order details page (optional)
├── create/
│   └── page.tsx                      // Manual order creation (optional)
└── components/
    ├── OrdersTable.tsx               // Main data table
    ├── OrderFilters.tsx              // Filter panel
    ├── OrderDetailsDrawer.tsx        // Order details sidebar
    ├── OrderStatusBadge.tsx          // Status badge component
    ├── PaymentStatusBadge.tsx        // Payment status badge
    ├── OrderActionsMenu.tsx          // Actions dropdown
    ├── UpdateStatusForm.tsx          // Status update form
    ├── UpdateTrackingForm.tsx        // Tracking update form
    ├── ProcessRefundForm.tsx         // Refund processing form
    ├── CancelOrderForm.tsx           // Order cancellation form
    ├── OrderTimeline.tsx             // Status history timeline
    ├── OrderItemsList.tsx            // Order items display
    ├── OrderPricingBreakdown.tsx     // Pricing summary
    ├── ShippingAddressCard.tsx       // Shipping address display
    ├── OrderStatistics.tsx           // Dashboard stats cards
    └── BulkActionsToolbar.tsx        // Bulk actions bar

src/hooks/queries/
├── useOrders.ts                      // Fetch orders list
├── useOrderById.ts                   // Fetch single order
├── useOrderStatistics.ts             // Fetch order stats
└── useOrderAnalytics.ts              // Fetch analytics data

src/hooks/mutations/
├── useUpdateOrderStatus.ts           // Update order status
├── useUpdatePaymentStatus.ts         // Update payment status
├── useUpdateTracking.ts              // Update tracking info
├── useProcessRefund.ts               // Process refund
├── useCancelOrder.ts                 // Cancel order
├── useUpdateOrderNotes.ts            // Update notes
├── useBulkUpdateOrders.ts            // Bulk update
└── useResendNotification.ts          // Resend email

src/validators/
└── order-schemas.ts                  // Zod validation schemas

src/types/
└── order.types.ts                    // TypeScript interfaces
```

### Step 2: Core Components

#### OrdersTable.tsx
- Use `rizzui` Table component
- Columns: Order #, Customer, Date, Items, Total, Payment Status, Order Status, Actions
- Row selection for bulk actions
- Responsive design with horizontal scroll
- Loading skeleton states
- Empty state handling

#### OrderDetailsDrawer.tsx
- Full-height drawer (Rizzui Drawer)
- Tabbed interface:
  - Overview: Customer info, items, pricing
  - Timeline: Status history
  - Tracking: Shipping information
  - Notes: Customer and internal notes
- Quick action buttons at top
- Real-time data updates

#### OrderFilters.tsx
- Collapsible filter panel
- Filter groups:
  - Status filters (checkboxes)
  - Payment filters (checkboxes)
  - Date range picker
  - Price range slider
  - Search input (debounced)
- Active filter badges
- Clear all filters button
- Mobile-friendly drawer on small screens

#### UpdateStatusForm.tsx
- Status dropdown with workflow validation
- Notes textarea
- Conditional fields:
  - Tracking number (if shipping)
  - Cancellation reason (if cancelling)
- Email notification checkbox
- Submit with loading state

### Step 3: API Integration

#### useOrders Hook
```typescript
export function useOrders(params?: OrderListParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => apiClient.get(api.orders.list, { params }),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Auto-refresh every minute (optional)
  });
}
```

#### useUpdateOrderStatus Mutation
```typescript
export function useUpdateOrderStatus(options?: UseMutationOptions) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      notes,
      trackingNumber,
      carrier 
    }: UpdateStatusInput) => {
      const response = await apiClient.put(
        api.orders.updateStatus(orderId),
        { status, notes, trackingNumber, carrier }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orderStatistics'] });
      options?.onSuccess?.(data, variables);
    },
    onError: options?.onError,
  });
}
```

### Step 4: Validation Schemas

```typescript
// order-schemas.ts
import { z } from 'zod';

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  notes: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  notifyCustomer: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.status === 'shipped') {
      return !!data.trackingNumber;
    }
    return true;
  },
  { message: 'Tracking number required when marking as shipped', path: ['trackingNumber'] }
);

export const processRefundSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  reason: z.string().min(10, 'Please provide a detailed reason'),
  refundShipping: z.boolean().default(false),
  restoreInventory: z.boolean().default(true),
  notifyCustomer: z.boolean().default(true),
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(10, 'Please provide a cancellation reason'),
  restoreInventory: z.boolean().default(true),
  notifyCustomer: z.boolean().default(true),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
```

### Step 5: Error Handling Pattern

```typescript
// In mutation hooks
const [apiErrors, setApiErrors] = useState<string[]>([]);

useEffect(() => {
  if (isError && error) {
    if (axios.isAxiosError(error)) {
      const backendErrors = extractBackendErrors(error);
      setApiErrors(backendErrors);
    } else {
      setApiErrors(['An unexpected error occurred']);
    }
  }
}, [isError, error]);

// Display errors in component
{apiErrors.length > 0 && (
  <div className="mb-4">
    {apiErrors.map((error, index) => (
      <Text key={index} className="text-sm text-red-500 mb-1">
        {error}
      </Text>
    ))}
  </div>
)}
```

---

## UI/UX Design Guidelines

### Status Color Coding
- **Pending**: `bg-yellow-100 text-yellow-800` (Yellow)
- **Confirmed**: `bg-blue-100 text-blue-800` (Blue)
- **Processing**: `bg-purple-100 text-purple-800` (Purple)
- **Shipped**: `bg-indigo-100 text-indigo-800` (Indigo)
- **Delivered**: `bg-green-100 text-green-800` (Green)
- **Cancelled**: `bg-red-100 text-red-800` (Red)
- **Refunded**: `bg-gray-100 text-gray-800` (Gray)

### Payment Status Colors
- **Pending**: `bg-yellow-100 text-yellow-800`
- **Paid**: `bg-green-100 text-green-800`
- **Failed**: `bg-red-100 text-red-800`
- **Refunded**: `bg-gray-100 text-gray-800`
- **Partially Refunded**: `bg-orange-100 text-orange-800`

### Responsive Breakpoints
- Mobile: `< 640px` - Single column, drawer filters
- Tablet: `640px - 1024px` - Compact table, visible filters
- Desktop: `> 1024px` - Full table, sidebar filters

### Loading States
- Table skeleton with 5 shimmer rows
- Individual row loading for actions
- Spinner in buttons during submission
- Progress indicator for bulk actions

### Toast Notifications
- Success: "Order #12345 status updated to Shipped"
- Error: "Failed to update order status. Please try again."
- Info: "Refund processed. Email sent to customer."
- Warning: "Cannot ship order without valid address"

---

## Testing Checklist

### Unit Tests
- [ ] Validation schemas work correctly
- [ ] Status workflow validation
- [ ] Price calculations
- [ ] Date formatting utilities

### Integration Tests
- [ ] Orders list loads with correct data
- [ ] Filters apply correctly
- [ ] Search returns relevant results
- [ ] Status update works
- [ ] Refund processing works
- [ ] Bulk actions work
- [ ] Error handling displays errors

### E2E Tests
- [ ] Complete order management workflow
- [ ] Status update flow (pending → delivered)
- [ ] Refund processing flow
- [ ] Order cancellation flow
- [ ] Bulk status update
- [ ] Export functionality
- [ ] Invoice generation

---

## Implementation Phases

### Phase 1: Core Viewing (Week 1)
- Orders list page with table
- Basic filtering (status, payment status)
- Search functionality
- Order details drawer
- Responsive design

### Phase 2: Status Management (Week 1)
- Update order status
- Update payment status
- Status workflow validation
- Email notifications
- Status history timeline

### Phase 3: Shipping & Tracking (Week 2)
- Add/update tracking information
- Shipping label generation (placeholder)
- Carrier integration points
- Delivery confirmation

### Phase 4: Refunds & Cancellations (Week 2)
- Refund processing
- Partial refund support
- Order cancellation
- Inventory restoration
- Payment gateway integration

### Phase 5: Analytics & Reporting (Week 3)
- Order statistics dashboard
- Revenue analytics
- Export functionality
- Invoice generation
- Reports

### Phase 6: Advanced Features (Week 3)
- Bulk actions
- Advanced filters
- Real-time updates
- Audit logs
- Permissions integration

---

## Success Metrics

- Order processing time reduced by 50%
- Status update completion in < 5 seconds
- Mobile usability score > 90%
- Zero data loss during operations
- 99.9% uptime for order management
- Customer satisfaction with order tracking
- Staff productivity improvement

---

## Dependencies

### Required Packages
```json
{
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "rizzui": "latest",
  "date-fns": "^3.x",
  "react-icons": "^5.x",
  "recharts": "^2.x" // For analytics charts
}
```

### Optional Packages
```json
{
  "jspdf": "^2.x", // PDF invoice generation
  "xlsx": "^0.18.x", // Excel export
  "react-to-print": "^2.x", // Print functionality
  "socket.io-client": "^4.x" // Real-time updates
}
```

---

## Notes for Backend Team

1. **Pagination**: Use cursor-based pagination for better performance with large datasets
2. **Caching**: Implement Redis caching for frequently accessed orders
3. **Search**: Consider Elasticsearch for advanced search capabilities
4. **Email Queue**: Use background jobs (Bull/BullMQ) for email notifications
5. **Webhooks**: Support webhooks for payment and shipping status updates
6. **Rate Limiting**: Apply rate limits on status update endpoints
7. **Audit Logs**: Log all order modifications with user details
8. **Soft Deletes**: Use soft deletes for orders (never hard delete)
9. **Transactions**: Use database transactions for refunds and cancellations
10. **Performance**: Optimize queries with proper indexing (orderNumber, user, status, createdAt)

---

## Additional Considerations

### Accessibility
- Keyboard navigation support
- Screen reader friendly labels
- High contrast mode support
- Focus indicators on interactive elements

### Security
- Role-based access control
- Validate all inputs server-side
- Sanitize user-generated content
- Encrypt sensitive payment data
- Log all administrative actions

### Performance
- Implement virtual scrolling for large lists
- Lazy load order details
- Optimize images in order items
- Use React.memo for expensive components
- Debounce search and filter inputs

### Internationalization (Future)
- Support multiple currencies
- Date/time localization
- Number formatting by locale
- Translated email templates
- Multi-language support

---

**Ready to implement! Please review and confirm before I proceed with the frontend development.**
