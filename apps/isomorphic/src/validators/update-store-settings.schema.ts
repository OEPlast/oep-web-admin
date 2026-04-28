import { z } from 'zod';

export const updateStoreSettingsSchema = z.object({
  storeName: z.string().optional(),
  companyName: z.string().optional(),
  logoUrl: z.string().optional(),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  supportEmail: z.string().email('Must be a valid email').optional().or(z.literal('')),
  supportPhone: z.string().optional(),
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
  socialLinks: z
    .object({
      instagram: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      facebook: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      whatsapp: z.string().optional(),
      x: z.string().url('Must be a valid URL').optional().or(z.literal('')),
      threads: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    })
    .optional(),
});

export type UpdateStoreSettingsInput = z.infer<typeof updateStoreSettingsSchema>;
