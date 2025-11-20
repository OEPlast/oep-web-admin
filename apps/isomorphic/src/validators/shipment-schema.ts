import { z } from 'zod';

// Shipping address schema
export const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  address1: z.string().min(5, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
});

// Dimensions schema
export const dimensionsSchema = z
  .object({
    length: z.number().positive('Length must be positive').optional(),
    width: z.number().positive('Width must be positive').optional(),
    height: z.number().positive('Height must be positive').optional(),
    weight: z.number().positive('Weight must be positive').optional(),
  })
  .optional();

// Shipment status
export const shipmentStatusSchema = z.enum([
  'In-Warehouse',
  'Shipped',
  'Dispatched',
  'Delivered',
  'Returned',
  'Failed',
]);

// Create shipment schema
export const createShipmentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  courier: z.string().min(2, 'Courier name is required'),
  shippingAddress: shippingAddressSchema,
  estimatedDelivery: z.string().optional(),
  dimensions: dimensionsSchema,
  cost: z.number().positive('Cost must be positive'),
  notes: z.string().optional(),
});

// Update shipment schema
export const updateShipmentSchema = z.object({
  courier: z.string().min(2).optional(),
  courierUser: z.string().min(2).optional(),
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
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(5, 'Description is required'),
  timestamp: z.string().optional(),
});

// Bulk update schema
export const bulkUpdateStatusSchema = z.object({
  shipmentIds: z.array(z.string()).min(1, 'Select at least one shipment'),
  status: shipmentStatusSchema,
  note: z.string().optional(),
});

// Export types from schemas
export type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentFormData = z.infer<typeof updateShipmentSchema>;
export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;
export type AddTrackingFormData = z.infer<typeof addTrackingSchema>;
export type BulkUpdateStatusFormData = z.infer<typeof bulkUpdateStatusSchema>;
