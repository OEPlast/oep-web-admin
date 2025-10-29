import { z } from 'zod';
import { messages } from '@/config/messages';
import { fileSchema } from './common-rules';

// form zod validation schema
export const updateBannerFormSchema = z.object({
  name: z.string().min(1, { message: 'Banner name is required' }),
  imageUrl: z.string().min(1, { message: 'Banner image is required' }),
  pageLink: z
    .string()
    .min(1, { message: 'Page link is required' })
    .regex(/^\/.*/, { message: 'Page link must start with /' }),
  headerText: z
    .string()
    .min(1, { message: 'Header text is required' })
    .max(200, { message: 'Header text must be 200 characters or less' }).optional(),
  mainText: z
    .string()
    .min(1, { message: 'Main text is required' })
    .max(500, { message: 'Main text must be 500 characters or less' }),
  CTA: z
    .string()
    .min(1, { message: 'CTA is required' })
    .max(100, { message: 'CTA must be 100 characters or less' }).optional(),
  fullImage: z.boolean(),
  active: z.boolean(),
  category: z.enum(['A', 'B', 'C', 'D', 'E'], {
    message: 'Please select a valid category',
  }),
  _id: z.string().optional(),
  createdAt: z.string().optional(),
});

// generate form types from zod validation schema
export type UpdateBannerFormInput = z.infer<typeof updateBannerFormSchema>;


export const createBannerFormSchema = z.object({
  name: z.string().min(1, { message: 'Banner name is required' }),
  imageUrl: z.string().min(1, { message: 'Banner image is required' }),
  pageLink: z
    .string()
    .min(1, { message: 'Page link is required' })
    .regex(/^\/.*/, { message: 'Page link must start with /' }),
  headerText: z
    .string()
    .min(1, { message: 'Header text is required' })
    .max(200, { message: 'Header text must be 200 characters or less' }).optional(),
  mainText: z
    .string()
    .min(1, { message: 'Main text is required' })
    .max(500, { message: 'Main text must be 500 characters or less' }).optional(),
  CTA: z
    .string()
    .min(1, { message: 'CTA is required' })
    .max(100, { message: 'CTA must be 100 characters or less' }).optional(),
  fullImage: z.boolean(),
  active: z.boolean().optional(),
  category: z.enum(['A', 'B', 'C', 'D', 'E'], {
    message: 'Please select a valid category',
  })
});

// generate form types from zod validation schema
export type CreateBannerFormInput = z.infer<typeof createBannerFormSchema>;
