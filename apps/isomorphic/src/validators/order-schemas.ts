import { z } from 'zod';

export const updateStatusSchema = z
  .object({
    status: z.enum([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ]),
    notes: z.string().optional(),
    trackingNumber: z.string().optional(),
    carrier: z.string().optional(),
    notifyCustomer: z.boolean().default(true),
  })
  .refine(
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
  paymentStatus: z.enum([
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded',
  ]),
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
  reason: z
    .string()
    .min(10, 'Please provide a detailed reason (minimum 10 characters)'),
  refundShipping: z.boolean().default(false),
  restoreInventory: z.boolean().default(true),
  notifyCustomer: z.boolean().default(true),
});

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a cancellation reason (minimum 10 characters)'),
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
