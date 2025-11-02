import { z } from 'zod';

const slugRegex = /^[a-z0-9-]+$/;

const toOptionalDate = z.preprocess((v) => {
  if (v === null || v === undefined || v === '') return undefined;
  if (v instanceof Date) return v;
  return undefined;
}, z.date().optional());
export const createCampaignSchema = z
  .object({
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .max(64, 'Slug must be at most 64 characters')
      .regex(slugRegex, 'Slug may only contain lowercase letters, numbers, and hyphens')
      .transform((v) => v.trim().toLowerCase()),
    image: z.string().min(1, 'Image is required').url('Must be a valid URL'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive', 'draft']).default('draft'),
    startDate: toOptionalDate,
    endDate: toOptionalDate,
    products: z.array(z.string()).optional(),
    sales: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Both dates together or both omitted
      const hasStart = !!data.startDate;
      const hasEnd = !!data.endDate;
      return hasStart === hasEnd;
    },
    {
      message: 'Both start and end dates must be provided together or omitted',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      // At least one product or one sale
      const hasProducts = data.products && data.products.length > 0;
      const hasSales = data.sales && data.sales.length > 0;
      return hasProducts || hasSales;
    },
    {
      message: 'At least one product or one sale is required',
      path: ['products'],
    }
  );

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = Partial<CreateCampaignInput>;
