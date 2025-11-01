# 📦 SHIPMENT MANAGEMENT SYSTEM - COMPLETE IMPLEMENTATION PLAN

## 🎯 Overview

This document outlines the **complete implementation plan** for the Shipment Management System, covering both **backend (100% complete)** and **frontend (admin dashboard integration)**.

The system enables admin users to:

- Create and manage shipments for orders
- Track shipment status in real-time
- Update tracking history
- View shipment analytics
- Manage bulk shipment operations
- Filter shipments by status
- Track shipments publicly via tracking number

---

## 📊 Current Status

### ✅ **Backend Status: 100% COMPLETE**

All backend components are fully implemented and functional:

#### **1. Database Model** ✅

**File**: `/old-main-server/src/models/Shipment.ts`

**Schema Structure**:

```typescript
{
  orderId: ObjectId (ref: Order, required)
  trackingNumber: String (unique, auto-generated)
  courier: String (e.g., "DHL", "FedEx")
  status: Enum ['In-Warehouse', 'Shipped', 'Dispatched', 'Delivered', 'Returned', 'Failed']
  estimatedDelivery: Date
  actualDelivery: Date
  shippingAddress: {
    firstName, lastName, phoneNumber,
    address1, address2, city, state, zipCode, country
  }
  dimensions: { length, width, height, weight }
  cost: Number (required)
  notes: String
  trackingHistory: [{
    location: String
    timestamp: Date
    description: String
  }]
  createdAt, updatedAt: Timestamps
}
```

#### **2. Admin Service Layer** ✅

**File**: `/old-main-server/src/services/admin/ShipmentService.ts`

**Available Methods** (11 methods):

- `createShipment(shipmentData)` - Create new shipment with auto-generated tracking number
- `getAllShipments(page, limit, status?)` - List shipments with pagination and optional status filter
- `getShipmentById(shipmentId)` - Get single shipment details with order population
- `updateShipment(shipmentId, updateData)` - Update shipment information
- `deleteShipment(shipmentId)` - Delete a shipment
- `updateShipmentStatus(shipmentId, status, note?)` - Update status with tracking entry
- `getShipmentTracking(shipmentId)` - Get tracking history
- `addTrackingUpdate(shipmentId, trackingData)` - Add new tracking entry
- `bulkUpdateStatus(shipmentIds[], status, note?)` - Bulk status update
- `getShipmentsByStatus(status, page, limit)` - Filter shipments by status
- `trackShipment(trackingNumber)` - Public tracking by tracking number

#### **3. Admin Controller** ✅

**File**: `/old-main-server/src/controller/admin/ShipmentController.ts`

**Available Endpoints** (10 endpoints):

- `POST /admin/shipment` - Create shipment
- `GET /admin/shipment` - List all shipments (with pagination & status filter)
- `GET /admin/shipment/:shipmentId` - Get shipment by ID
- `PUT /admin/shipment/:shipmentId` - Update shipment
- `DELETE /admin/shipment/:shipmentId` - Delete shipment
- `PATCH /admin/shipment/:shipmentId/status` - Update status
- `GET /admin/shipment/:shipmentId/tracking` - Get tracking history
- `POST /admin/shipment/:shipmentId/tracking` - Add tracking update
- `POST /admin/shipment/bulk/status` - Bulk status update
- `GET /admin/shipment/filter/status/:status` - Filter by status

#### **4. User Service & Controller** ✅

**Files**:

- `/old-main-server/src/services/ShipmentService.ts`
- `/old-main-server/src/controller/ShipmentController.ts`

**User-Facing Methods**:

- `getShipmentForOrder(orderId, userId)` - Get shipment for user's order
- `getUserShipments(userId, page, limit)` - List user's shipments
- `trackShipmentByTrackingNumber(trackingNumber)` - Public tracking
- `getDeliveryStatus(orderId)` - Get delivery status for order

**User Endpoints**:

- `GET /user/orders/:orderId/shipment` - Get shipment for order
- `GET /user/shipments` - List user shipments
- `GET /user/orders/:orderId/delivery-status` - Get delivery status
- `GET /user/track/:trackingNumber` - Public tracking (no auth)

#### **5. Validation** ✅

**File**: `/old-main-server/src/validators/admin/ShipmentValidator.ts`

**Validators** (7 validators):

- `createShipmentValidator` - Validate shipment creation
- `updateShipmentValidator` - Validate shipment updates
- `shipmentIdValidator` - Validate MongoDB ObjectId
- `updateStatusValidator` - Validate status updates
- `addTrackingValidator` - Validate tracking entries
- `statusFilterValidator` - Validate status filter
- `bulkUpdateValidator` - Validate bulk operations

#### **6. Routes Configuration** ✅

**Files**:

- `/old-main-server/src/routes/admin/shipment.ts` - Admin routes
- `/old-main-server/src/routes/users/shipments.ts` - User routes
- `/old-main-server/src/routes/general/logistics.ts` - Public logistics routes

**Security**:

- ✅ Admin routes protected with `authenticateUser` + `isAdmin`
- ✅ Permission-based access control (`requirePermission('logistics', 'read|create|update|delete')`)
- ✅ User routes protected with `authenticateUser`
- ✅ Public tracking endpoint (no auth required)

---

## 🎨 Frontend Implementation Plan

### ❌ **Frontend Status: NOT STARTED**

Need to implement complete admin dashboard integration for shipment management.

---

## 📋 Implementation Phases

### **PHASE 1: Foundation - TypeScript Types & Validation** 🔧

#### **Task 1.1: Create TypeScript Interfaces**

**File**: `/apps/isomorphic/src/types/shipment.types.ts`

**Interfaces to Create**:

```typescript
// Shipment status enum
export type ShipmentStatus = "In-Warehouse" | "Shipped" | "Dispatched" | "Delivered" | "Returned" | "Failed";

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

// Main shipment interface
export interface Shipment {
  _id: string;
  orderId: string | OrderRef; // Can be populated
  trackingNumber: string;
  courier: string;
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

// For order population
export interface OrderRef {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  customerInfo?: {
    name: string;
    email: string;
  };
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
```

**Export in index**:

```typescript
// File: /apps/isomorphic/src/types/index.ts
export * from "./shipment.types";
```

---

#### **Task 1.2: Create Zod Validation Schemas**

**File**: `/apps/isomorphic/src/validators/shipment-schema.ts`

**Schemas to Create**:

```typescript
import { z } from "zod";

// Shipping address schema
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Valid phone number required"),
  address1: z.string().min(5, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(3, "Zip code is required"),
  country: z.string().min(2, "Country is required"),
});

// Dimensions schema
export const dimensionsSchema = z
  .object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    weight: z.number().positive().optional(),
  })
  .optional();

// Shipment status
export const shipmentStatusSchema = z.enum(["In-Warehouse", "Shipped", "Dispatched", "Delivered", "Returned", "Failed"]);

// Create shipment schema
export const createShipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  courier: z.string().min(2, "Courier name is required"),
  shippingAddress: shippingAddressSchema,
  estimatedDelivery: z.string().optional(),
  dimensions: dimensionsSchema,
  cost: z.number().positive("Cost must be positive"),
  notes: z.string().optional(),
});

// Update shipment schema
export const updateShipmentSchema = z.object({
  courier: z.string().min(2).optional(),
  shippingAddress: shippingAddressSchema.partial().optional(),
  estimatedDelivery: z.string().optional(),
  actualDelivery: z.string().optional(),
  dimensions: dimensionsSchema,
  cost: z.number().positive().optional(),
  notes: z.string().optional(),
  status: shipmentStatusSchema.optional(),
});

// Update status schema
export const updateStatusSchema = z.object({
  status: shipmentStatusSchema,
  note: z.string().optional(),
});

// Add tracking schema
export const addTrackingSchema = z.object({
  status: shipmentStatusSchema,
  location: z.string().min(2, "Location is required"),
  description: z.string().min(5, "Description is required"),
  timestamp: z.string().optional(),
});

// Bulk update schema
export const bulkUpdateStatusSchema = z.object({
  shipmentIds: z.array(z.string()).min(1, "Select at least one shipment"),
  status: shipmentStatusSchema,
  note: z.string().optional(),
});

// Export types from schemas
export type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentFormData = z.infer<typeof updateShipmentSchema>;
export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;
export type AddTrackingFormData = z.infer<typeof addTrackingSchema>;
export type BulkUpdateStatusFormData = z.infer<typeof bulkUpdateStatusSchema>;
```

---

### **PHASE 2: Data Layer - API Integration** 🔌

#### **Task 2.1: Add Shipment Endpoints**

**File**: `/apps/isomorphic/src/libs/endpoints.ts`

**Add to existing endpoints object**:

```typescript
export const endpoints = {
  // ... existing endpoints

  shipment: {
    // Admin endpoints
    list: "/admin/shipment", // GET with ?page=1&limit=10&status=Shipped
    byId: (id: string) => `/admin/shipment/${id}`, // GET
    create: "/admin/shipment", // POST
    update: (id: string) => `/admin/shipment/${id}`, // PUT
    delete: (id: string) => `/admin/shipment/${id}`, // DELETE
    updateStatus: (id: string) => `/admin/shipment/${id}/status`, // PATCH
    tracking: (id: string) => `/admin/shipment/${id}/tracking`, // GET
    addTracking: (id: string) => `/admin/shipment/${id}/tracking`, // POST
    bulkUpdateStatus: "/admin/shipment/bulk/status", // POST
    byStatus: (status: string) => `/admin/shipment/filter/status/${status}`, // GET

    // Public/User endpoints
    publicTracking: (trackingNumber: string) => `/logistics/track/${trackingNumber}`, // GET
    userShipments: "/user/shipments", // GET
    orderShipment: (orderId: string) => `/user/orders/${orderId}/shipment`, // GET
    orderDeliveryStatus: (orderId: string) => `/user/orders/${orderId}/delivery-status`, // GET
  },
};
```

---

#### **Task 2.2: Create React Query Hooks**

**File**: `/apps/isomorphic/src/hooks/use-shipment.ts`

**Hooks to Create**:

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { apiClient } from "@/libs/api-client";
import { endpoints } from "@/libs/endpoints";
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
} from "@/types/shipment.types";

// Query keys factory
const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (filters: ShipmentFilters) => [...shipmentKeys.lists(), filters] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  tracking: (id: string) => [...shipmentKeys.all, "tracking", id] as const,
  byStatus: (status: string, page: number) => [...shipmentKeys.all, "status", status, page] as const,
  publicTracking: (trackingNumber: string) => ["tracking", trackingNumber] as const,
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
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status) params.append("status", status);

      const response = await apiClient.get(`${endpoints.shipment.list}?${params.toString()}`);
      return response.data.data;
    },
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
      const response = await apiClient.get(endpoints.shipment.byId(shipmentId));
      return response.data.data;
    },
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
      const response = await apiClient.get(endpoints.shipment.tracking(shipmentId));
      return response.data.data;
    },
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
      const response = await apiClient.get(`${endpoints.shipment.byStatus(status)}?page=${page}&limit=${limit}`);
      return response.data.data;
    },
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
      const response = await apiClient.get(endpoints.shipment.publicTracking(trackingNumber));
      return response.data.data;
    },
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
      const response = await apiClient.post(endpoints.shipment.create, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success("Shipment created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create shipment");
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
      const response = await apiClient.put(endpoints.shipment.update(shipmentId), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success("Shipment updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update shipment");
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
      await apiClient.delete(endpoints.shipment.delete(shipmentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success("Shipment deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete shipment");
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
      const response = await apiClient.patch(endpoints.shipment.updateStatus(shipmentId), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.tracking(shipmentId) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success("Status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
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
      const response = await apiClient.post(endpoints.shipment.addTracking(shipmentId), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(shipmentId) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.tracking(shipmentId) });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      toast.success("Tracking update added successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add tracking update");
    },
  });
};

/**
 * 11. Bulk update status (Admin)
 */
export const useBulkUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkUpdateStatusInput): Promise<{ updatedCount: number }> => {
      const response = await apiClient.post(endpoints.shipment.bulkUpdateStatus, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.all });
      toast.success(`${data.updatedCount} shipment(s) updated successfully!`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to bulk update shipments");
    },
  });
};
```

---

### **PHASE 3: UI Components** 🎨

#### **Task 3.1: Shipments Table Component**

**File**: `/apps/isomorphic/src/app/shared/shipment/shipments-table.tsx`

**Features**:

- Display shipments in a data table
- Columns: Tracking Number, Order ID, Courier, Status, Estimated Delivery, Cost, Actions
- Search by tracking number or courier
- Filter by status (dropdown)
- Pagination
- Status badges with colors
- View/Edit/Delete actions
- Bulk selection for bulk operations
- Export to CSV

**Status Badge Colors**:

- In-Warehouse: Yellow
- Shipped: Blue
- Dispatched: Cyan
- Delivered: Green
- Returned: Orange
- Failed: Red

---

#### **Task 3.2: Create Shipment Form**

**File**: `/apps/isomorphic/src/app/shared/shipment/create-shipment-form.tsx`

**Form Fields**:

- Order ID (select from orders)
- Courier (input)
- Shipping Address (nested fields)
- Estimated Delivery Date (date picker)
- Dimensions (optional: length, width, height, weight)
- Cost (number input)
- Notes (textarea)

**Features**:

- Form validation with Zod
- Auto-fill address from order
- Real-time validation
- Submit to create shipment API

---

#### **Task 3.3: Edit Shipment Form**

**File**: `/apps/isomorphic/src/app/shared/shipment/edit-shipment-form.tsx`

**Same as create form but**:

- Pre-populated with existing data
- Additional field: Status dropdown
- Actual Delivery Date field
- Tracking Number (read-only)

---

#### **Task 3.4: Shipment Details View**

**File**: `/apps/isomorphic/src/app/shared/shipment/shipment-details.tsx`

**Sections**:

1. **Shipment Info Card**:

   - Tracking Number (large, prominent)
   - Status badge
   - Order ID (link to order details)
   - Courier
   - Cost
   - Created/Updated dates

2. **Shipping Address Card**:

   - Full address display
   - Contact info

3. **Dimensions Card** (if available):

   - Length × Width × Height
   - Weight

4. **Tracking History Timeline**:

   - Vertical timeline component
   - Each entry shows: timestamp, location, description
   - Color-coded by status

5. **Actions**:
   - Edit Shipment button
   - Update Status button
   - Add Tracking Update button
   - Delete Shipment button (with confirmation)

---

#### **Task 3.5: Update Status Modal**

**File**: `/apps/isomorphic/src/app/shared/shipment/update-status-modal.tsx`

**Features**:

- Status dropdown (all 6 statuses)
- Optional note textarea
- Submit button
- Uses `useUpdateShipmentStatus` hook

---

#### **Task 3.6: Add Tracking Update Modal**

**File**: `/apps/isomorphic/src/app/shared/shipment/add-tracking-modal.tsx`

**Form Fields**:

- Status (dropdown)
- Location (input)
- Description (textarea)
- Timestamp (auto-filled, editable)

**Features**:

- Form validation
- Uses `useAddTrackingUpdate` hook

---

#### **Task 3.7: Bulk Operations Component**

**File**: `/apps/isomorphic/src/app/shared/shipment/bulk-operations.tsx`

**Features**:

- Select multiple shipments (checkboxes)
- Bulk actions dropdown:
  - Update Status (opens bulk status modal)
  - Export Selected
  - Delete Selected (with confirmation)
- Shows count of selected items
- Clear selection button

---

#### **Task 3.8: Public Tracking Page**

**File**: `/apps/isomorphic/src/app/(hydrogen)/tracking/page.tsx`

**Features**:

- Search input for tracking number
- No authentication required
- Displays tracking info:
  - Status badge
  - Estimated delivery
  - Tracking history timeline
- Error handling for invalid tracking numbers

---

### **PHASE 4: Page Components** 📄

#### **Task 4.1: Shipments List Page**

**File**: `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/page.tsx`

**Components Used**:

- PageHeader with "Shipments" title
- ShipmentsTable component
- BulkOperations component
- Create Shipment button (links to create page)

---

#### **Task 4.2: Create Shipment Page**

**File**: `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/create/page.tsx`

**Components Used**:

- PageHeader with "Create Shipment" title
- Breadcrumbs
- CreateShipmentForm component
- Cancel button (back to list)

---

#### **Task 4.3: Shipment Details Page**

**File**: `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/[id]/page.tsx`

**Components Used**:

- PageHeader with tracking number
- Breadcrumbs
- ShipmentDetails component
- UpdateStatusModal
- AddTrackingModal

---

#### **Task 4.4: Edit Shipment Page**

**File**: `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/[id]/edit/page.tsx`

**Components Used**:

- PageHeader with "Edit Shipment" title
- Breadcrumbs
- EditShipmentForm component
- Cancel button (back to details)

---

### **PHASE 5: Routes & Navigation** 🧭

#### **Task 5.1: Verify Routes Configuration**

**File**: `/apps/isomorphic/src/config/routes.ts`

Routes already exist (verify):

```typescript
shipment: {
  dashboard: '/logistics',
  shipmentList: '/logistics/shipments',
  customerProfile: '/logistics/customer-profile',
  createShipment: '/logistics/shipments/create',
  editShipment: (id: string) => `/logistics/shipments/${id}/edit`,
  shipmentDetails: (id: string) => `/logistics/shipments/${id}`,
  tracking: (id: string) => `/logistics/tracking/${id}`,
}
```

#### **Task 5.2: Update Navigation Menu**

**Find and update navigation config file**

Add "Shipments" menu item under Logistics section:

```typescript
{
  name: 'Shipments',
  href: routes.shipment.shipmentList,
  icon: <PiPackage />, // or appropriate icon
}
```

---

## 📊 Implementation Summary

### **Files to Create** (15 new files):

**Types & Validation** (2 files):

1. `/apps/isomorphic/src/types/shipment.types.ts` - TypeScript interfaces
2. `/apps/isomorphic/src/validators/shipment-schema.ts` - Zod schemas

**Hooks** (1 file): 3. `/apps/isomorphic/src/hooks/use-shipment.ts` - React Query hooks (11 hooks)

**Shared Components** (7 files): 4. `/apps/isomorphic/src/app/shared/shipment/shipments-table.tsx` - Main table 5. `/apps/isomorphic/src/app/shared/shipment/create-shipment-form.tsx` - Create form 6. `/apps/isomorphic/src/app/shared/shipment/edit-shipment-form.tsx` - Edit form 7. `/apps/isomorphic/src/app/shared/shipment/shipment-details.tsx` - Details view 8. `/apps/isomorphic/src/app/shared/shipment/update-status-modal.tsx` - Status modal 9. `/apps/isomorphic/src/app/shared/shipment/add-tracking-modal.tsx` - Tracking modal 10. `/apps/isomorphic/src/app/shared/shipment/bulk-operations.tsx` - Bulk actions

**Pages** (4 files): 11. `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/page.tsx` - List page 12. `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/create/page.tsx` - Create page 13. `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/[id]/page.tsx` - Details page 14. `/apps/isomorphic/src/app/(hydrogen)/logistics/shipments/[id]/edit/page.tsx` - Edit page

**Public Page** (1 file): 15. `/apps/isomorphic/src/app/(hydrogen)/tracking/page.tsx` - Public tracking

### **Files to Modify** (2 files):

1. `/apps/isomorphic/src/libs/endpoints.ts` - Add shipment endpoints
2. `/apps/isomorphic/src/types/index.ts` - Export shipment types

---

## 🎯 Backend API Summary

### **Admin Endpoints** (10 endpoints):

| Method | Endpoint                                         | Description          |
| ------ | ------------------------------------------------ | -------------------- |
| POST   | `/admin/shipment`                                | Create shipment      |
| GET    | `/admin/shipment?page=1&limit=20&status=Shipped` | List shipments       |
| GET    | `/admin/shipment/:id`                            | Get shipment by ID   |
| PUT    | `/admin/shipment/:id`                            | Update shipment      |
| DELETE | `/admin/shipment/:id`                            | Delete shipment      |
| PATCH  | `/admin/shipment/:id/status`                     | Update status        |
| GET    | `/admin/shipment/:id/tracking`                   | Get tracking history |
| POST   | `/admin/shipment/:id/tracking`                   | Add tracking update  |
| POST   | `/admin/shipment/bulk/status`                    | Bulk status update   |
| GET    | `/admin/shipment/filter/status/:status`          | Filter by status     |

### **Public/User Endpoints** (4 endpoints):

| Method | Endpoint                                | Description        |
| ------ | --------------------------------------- | ------------------ |
| GET    | `/logistics/track/:trackingNumber`      | Public tracking    |
| GET    | `/user/shipments?page=1&limit=10`       | User's shipments   |
| GET    | `/user/orders/:orderId/shipment`        | Shipment for order |
| GET    | `/user/orders/:orderId/delivery-status` | Delivery status    |

---

## 🧪 Testing Checklist

### **Backend Testing** ✅ (Already Complete):

- [x] Create shipment with valid data
- [x] List shipments with pagination
- [x] Get shipment by ID
- [x] Update shipment details
- [x] Delete shipment
- [x] Update shipment status
- [x] Get tracking history
- [x] Add tracking update
- [x] Bulk status update
- [x] Filter by status
- [x] Public tracking by tracking number
- [x] User shipments list
- [x] Validation errors handled
- [x] Permission checks working

### **Frontend Testing** (To Do):

- [ ] View shipments list with pagination
- [ ] Search shipments by tracking number
- [ ] Filter shipments by status
- [ ] Create new shipment
- [ ] Edit existing shipment
- [ ] View shipment details
- [ ] Update shipment status
- [ ] Add tracking update
- [ ] Delete shipment (with confirmation)
- [ ] Bulk select and update status
- [ ] Public tracking page works
- [ ] Form validations display errors
- [ ] Toast notifications appear
- [ ] Loading states display
- [ ] Error states handled gracefully

---

## 📈 Expected Completion Time

- **Phase 1**: 2 hours (Types & Validation)
- **Phase 2**: 2 hours (API Integration & Hooks)
- **Phase 3**: 6 hours (UI Components - 7 components)
- **Phase 4**: 2 hours (Page Components - 4 pages)
- **Phase 5**: 1 hour (Routes & Navigation)

**Total**: ~13 hours of development

---

## 🎉 Success Criteria

### **Functional Requirements**:

✅ Admins can create shipments for orders  
✅ Admins can view all shipments with filters  
✅ Admins can update shipment details  
✅ Admins can update shipment status  
✅ Admins can add tracking updates  
✅ Admins can delete shipments  
✅ Admins can bulk update shipment status  
✅ Public users can track shipments by tracking number  
✅ All forms have validation  
✅ Real-time updates with React Query cache

### **Technical Requirements**:

✅ Type-safe throughout (TypeScript)  
✅ Form validation with Zod  
✅ Optimistic updates where appropriate  
✅ Error handling on all API calls  
✅ Loading states on async operations  
✅ Toast notifications for user feedback  
✅ Responsive design (mobile/tablet/desktop)  
✅ Follows existing codebase patterns

---

## 🚀 Next Steps

1. **Review this plan** - Confirm approach and scope
2. **Start Phase 1** - Create TypeScript types and Zod schemas
3. **Proceed sequentially** - Complete each phase before moving to next
4. **Test incrementally** - Test each component as it's built
5. **Final integration** - Ensure all components work together
6. **Documentation** - Update README with shipment management guide

---

**Status**: ✅ Backend Complete | ❌ Frontend Pending  
**Ready to Start**: Phase 1 - Foundation (Types & Validation)

---

## 📞 Questions Before Starting?

- Confirm shipment creation flow (manual vs auto-create from orders)?
- Any specific courier integrations needed (DHL, FedEx APIs)?
- Should tracking history be editable or append-only?
- Export format preferences (CSV, PDF, Excel)?
- Any analytics/reporting requirements?

---

**Let's build this! 🚀**
