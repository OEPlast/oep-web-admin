import { z } from 'zod';
import { messages } from '@/config/messages';
const preprocessOptionalNumber = (isInteger = false) =>
  z.preprocess(
    (val) => {
      if (
        val === null ||
        val === undefined ||
        val === '' ||
        (typeof val === 'number' && isNaN(val))
      ) {
        return undefined;
      }
      const num = Number(val);
      return isInteger ? Math.floor(num) : num;
    },
    isInteger
      ? z.number().int().min(0).optional()
      : z.number().min(0).optional()
  );

// Pricing tier schema
const pricingTierSchema = z
  .object({
    minQty: z.number().int().min(1, 'Minimum quantity must be at least 1'),
    maxQty: z.preprocess((val) => {
      // Convert NaN, null, undefined, empty string to undefined
      if (
        val === null ||
        val === undefined ||
        val === '' ||
        (typeof val === 'number' && isNaN(val))
      ) {
        return undefined;
      }
      return val;
    }, z.number().int().min(1).optional()),
    strategy: z.enum(['fixedPrice', 'percentOff', 'amountOff']),
    value: z.number().min(0, 'Value must be non-negative'),
  })
  .refine((data) => !data.maxQty || data.maxQty >= data.minQty, {
    message:
      'Maximum quantity must be greater than or equal to minimum quantity',
    path: ['maxQty'],
  });

// Pack size schema for bulk/wholesale products
const packSizeSchema = z.object({
  label: z
    .string()
    .min(1, 'Pack label is required (e.g., "Single", "Bag of 10")'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  price: preprocessOptionalNumber(),
  stock: preprocessOptionalNumber(true),
  enableAttributes: z.boolean().default(false),
});

// Product schema for create/update
const baseProductSchema = z.object({
  sku: z.number().int().min(1, 'SKU is required and must be a positive number'),
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),

  tags: z.array(z.string()).optional(),

  description_images: z
    .array(
      z.object({
        url: z.string(),
        cover_image: z.boolean(),
      })
    )
    .min(1, 'At least one product image is required'),

  specifications: z
    .array(
      z.object({
        key: z.string().min(1, 'Specification key is required'),
        value: z.string().min(1, 'Specification value is required'),
      })
    )
    .optional(),

  dimension: z
    .array(
      z.object({
        key: z.enum([
          'length',
          'breadth',
          'height',
          'volume',
          'width',
          'weight',
        ]),
        value: z.string().min(1, 'Dimension value is required'),
      })
    )
    .optional(),

  shipping: z
    .object({
      addedCost: preprocessOptionalNumber(),
      increaseCostBy: preprocessOptionalNumber(),
      addedDays: preprocessOptionalNumber(true),
    })
    .optional(),

  attributes: z
    .array(
      z.object({
        name: z.string().min(1, 'Attribute name is required'),
        children: z.array(
          z.object({
            name: z.string().min(1, 'Child name is required'),
            price: preprocessOptionalNumber(),
            stock: z.number().int().min(0, 'Stock cannot be negative'),
            pricingTiers: z.array(pricingTierSchema).optional(),
          })
        ),
      })
    )
    .optional(),

  pricingTiers: z.array(pricingTierSchema).optional(),

  packSizes: z.array(packSizeSchema).optional(),

  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold is required'),
  status: z.enum(['active', 'inactive', 'archived']),

  slug: z.string().optional(), // Auto-generated, but can be manually set
});

// Product schema with refinement for create/update
export const productSchema = baseProductSchema.refine(
  (data) => data.description_images.some((img) => img.cover_image),
  {
    message: 'At least one image must be marked as cover image',
    path: ['description_images'],
  }
);

// Type for create product
export type CreateProductInput = z.infer<typeof productSchema>;

// Schema for update (all fields optional except those that shouldn't change)
// Use baseProductSchema instead of productSchema to avoid ZodEffects issue
export const updateProductSchema = baseProductSchema.partial().extend({
  sku: z.number().int().min(1, 'SKU is required').optional(), // Can't change SKU
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
