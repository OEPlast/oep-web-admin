import { z } from 'zod';

export const updateStoreSettingsSchema = z.object({
  storeName: z.string().optional(),
  companyName: z.string().optional(),
  logoUrl: z.string().optional(),
  websiteUrl: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  supportEmail: z
    .string()
    .email('Must be a valid email')
    .optional()
    .or(z.literal('')),
  supportPhone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  supportHours: z.string().max(120, 'Keep support hours under 120 characters').optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  taxId: z.string().optional(),
  taxRate: z
    .number({
      invalid_type_error: 'Tax rate must be a number',
    })
    .min(0, 'Tax rate must be at least 0')
    .max(100, 'Tax rate cannot exceed 100')
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter code (e.g., USD)')
    .optional()
    .or(z.literal('')),
  /* Reporting timezone. Every analytics bucket boundary is cut in this zone, so
  changing it changes every daily, weekly and monthly figure on the dashboards. */
  timezone: z.string().min(1, 'Select a timezone').optional(),
  // Storefront catalog: how long a product counts as a new arrival, and how many best sellers.
  newArrivalDays: z
    .number({ invalid_type_error: 'Enter a number of days' })
    .int('Use a whole number of days')
    .min(1, 'At least 1 day')
    .max(365, 'At most 365 days')
    .optional(),
  bestSellerCount: z
    .number({ invalid_type_error: 'Enter a number' })
    .int('Use a whole number')
    .min(1, 'At least 1')
    .max(200, 'At most 200')
    .optional(),
  bestSellerPicks: z.array(z.string()).max(50, 'At most 50 products').optional(),
  socialLinks: z
    .object({
      instagram: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
      facebook: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
      whatsapp: z.string().optional(),
      x: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      threads: z
        .string()
        .url('Must be a valid URL')
        .optional()
        .or(z.literal('')),
    })
    .optional(),
});

export type UpdateStoreSettingsInput = z.infer<
  typeof updateStoreSettingsSchema
>;
