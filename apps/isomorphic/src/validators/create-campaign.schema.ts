import { z } from 'zod';

export const createCampaignSchema = z
  .object({
    image: z.string().min(1, 'Image is required').url('Must be a valid URL'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive', 'draft']).default('draft'),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
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
