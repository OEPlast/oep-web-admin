import { z } from 'zod';

// Return status update schema
export const returnStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'items_received', 'inspecting', 'inspection_passed', 'inspection_failed', 'completed', 'cancelled']),
  adminNotes: z.string().min(1, 'Admin notes are required when updating status').max(500, 'Notes must be less than 500 characters'),
});

export type ReturnStatusUpdateInput = z.infer<typeof returnStatusUpdateSchema>;

// Refund process schema
export const refundProcessSchema = z
  .object({
    refundMethod: z.enum(['original_payment', 'store_credit', 'bank_transfer']),
    /** Naira. */
    refundAmount: z.number().positive('Refund amount must be positive'),
    adminNotes: z.string().min(1, 'Admin notes are required for refund processing').max(500, 'Notes must be less than 500 characters'),
    /** Pay out without the goods having passed inspection. Needs a written reason. */
    override: z.boolean().optional(),
    overrideReason: z.string().max(500).optional(),
  })
  .refine((v) => !v.override || (v.overrideReason ?? '').trim().length >= 10, {
    message: 'Give a reason of at least 10 characters for refunding without a passed inspection',
    path: ['overrideReason'],
  });

export type RefundProcessInput = z.infer<typeof refundProcessSchema>;

// Return filters schema for search/filtering
export const returnFiltersSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'items_received', 'inspecting', 'inspection_passed', 'inspection_failed', 'completed', 'cancelled']).optional(),
  returnType: z.enum(['refund', 'exchange']).optional(),
  reason: z.string().optional(),
  dateRange: z.object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  }).optional(),
  searchTerm: z.string().optional(),
});

export type ReturnFiltersInput = z.infer<typeof returnFiltersSchema>;
