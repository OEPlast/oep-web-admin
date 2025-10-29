import { z } from 'zod';

// Create category schema - for new categories
export const createCategoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(32, 'Category name must not exceed 32 characters'),
  description: z.string().optional(),
  image: z.string().optional().or(z.literal('')),
  slug: z.string().min(1, 'Slug is required'),
  banner: z.string().optional().or(z.literal('')),
  parent: z.array(z.string()).default([]).optional(),
  priority: z.boolean().default(false).optional(),
});

// Update category schema - includes server fields
export const updateCategoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(32, 'Category name must not exceed 32 characters'),
  description: z.string().optional(),
  image: z.string().optional().or(z.literal('')),
  banner: z.string().optional().or(z.literal('')),
  parent: z.array(z.string()).optional().default([]),
  priority: z.boolean().default(false).optional(),
  _id: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// TypeScript types inferred from schemas
export type CreateCategoryFormInput = z.infer<typeof createCategoryFormSchema>;
export type UpdateCategoryFormInput = z.infer<typeof updateCategoryFormSchema>;
