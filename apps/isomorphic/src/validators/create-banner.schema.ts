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
  active: z.boolean().default(false).optional(),
  category: z.enum(['A', 'B', 'C', 'D', 'E'], {
    message: 'Please select a valid category',
  })
});

// generate form types from zod validation schema
export type CreateBannerFormInput = z.infer<typeof createBannerFormSchema>;
