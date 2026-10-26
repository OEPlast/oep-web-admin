import { z } from 'zod';

/** GTIN-8/12/13/14 with the GS1 mod-10 check digit; mirrors Main-server's isValidGtin. */
export const isValidGtin = (value: string): boolean => {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return false;
  const digits = value.split('').map(Number);
  const check = digits.pop()!;
  const sum = digits
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
};

// Helper to handle optional numbers with proper typing
const optionalNumber = (isInteger = false) => {
  const base = z.number().min(0);
  const schema = isInteger ? base.int() : base;
  return schema.optional();
};

// Helper for preprocessing optional number fields that may come as empty strings
// An option's own price. Left empty it uses the product price: the input (valueAsNumber) gives
// NaN for an empty box, which means "no price", not an error.
const preprocessedOptionalNumber = z
  .union([z.number().min(0, 'Price cannot be negative'), z.nan()])
  .optional()
  .transform((v) => (v === undefined || Number.isNaN(v) ? undefined : v));

// Pricing tier schema
const pricingTierSchema = z
  .object({
    minQty: z.number().int().min(1, 'Minimum quantity must be at least 1'),
    maxQty: z.number().int().min(1).optional(), // ✅ Simplified - no .or() chain
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
  price: optionalNumber(),
  stock: optionalNumber(true),
  enableAttributes: z.boolean(),
});

// Base product schema
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
        mediaType: z.enum(['image', 'video']).optional(),
        miniUrl: z.string().optional(),
      })
    )
    .refine(
      (items) => items.some((i) => (i.mediaType ?? 'image') === 'image'),
      'At least one product image is required'
    ),

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
      addedCost: z.number().min(0).optional(),
      increaseCostBy: z.number().min(0).optional(),
      addedDays: z.number().int().min(0).optional(),
    })
    .optional(),

  // GIG shipping fields
  weight: z.number().min(0, 'Weight must be non-negative'),
  height: z.number().min(0, 'Height must be non-negative'),
  width: z.number().min(0, 'Width must be non-negative'),
  length: z.number().min(0, 'Length must be non-negative'),
  isVolumetric: z.boolean(),

  attributes: z
    .array(
      z.object({
        name: z.string().min(1, 'Attribute name is required'),
        // Optional groups start unpicked on the product page and can be left that way.
        optional: z.boolean().optional(),
        children: z.array(
          z.object({
            name: z.string().min(1, 'Child name is required'),
            price: preprocessedOptionalNumber,
            stock: z.number().int().min(0, 'Stock cannot be negative'),
            pricingTiers: z.array(pricingTierSchema).optional(),
            // Gallery shown when this value is selected: url paths from description_images.
            images: z.array(z.string()).optional(),
            // Swatch colour on the storefront (e.g. "#D4AF37"); empty means none. Main-server
            // rejects an empty string, so it is dropped rather than sent.
            colorCode: z
              .string()
              .trim()
              .optional()
              .refine((v) => !v || /^#([0-9a-f]{3}){1,2}$/i.test(v), 'Use a colour like #D4AF37')
              .transform((v) => v || undefined),
          })
        ),
      })
    )
    .optional(),

  pricingTiers: z.array(pricingTierSchema).optional(),

  // Price and stock per option combination (e.g. Gold + size 7). Empty means none: stock and
  // prices come from the product and its single options. Main-server checks them against the
  // option groups and sets the product's stock to their total.
  variants: z
    .array(
      z.object({
        key: z.string().optional(),
        options: z.array(z.object({ name: z.string(), value: z.string() })).min(1),
        price: preprocessedOptionalNumber,
        stock: z.number({ invalid_type_error: 'Enter the stock' }).int().min(0, 'Stock cannot be negative'),
        sku: z.string().trim().optional(),
      })
    )
    .optional(),

  // Optional add-ons that aren't products (e.g. a tester, free polish), ticked on the product page.
  extras: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Name the extra').max(60, 'At most 60 characters'),
        price: z.number({ invalid_type_error: 'Enter a price (0 for free)' }).min(0, 'Price cannot be negative'),
        description: z.string().trim().max(140, 'At most 140 characters').optional(),
      })
    )
    .max(10, 'At most 10 extras')
    .refine((list) => new Set(list.map((e) => e.name.toLowerCase())).size === list.length, 'Each extra needs a different name')
    .optional(),

  // Products offered next to this one on its page (e.g. a gift box), in order. Main-server takes 10.
  addOns: z.array(z.string()).max(10, 'Pick at most 10 add-ons').optional(),

  // Size chart slug; empty means the category's chart is used.
  sizeChart: z.string().optional(),

  packSizes: z.array(packSizeSchema).optional(),

  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold is required'),
  status: z.enum(['active', 'inactive', 'archived']),

  slug: z.string().optional(),

  // Google Shopping identity (Merchant Center feed + product structured data).
  brand: z.string().trim().max(70, 'Brand must be at most 70 characters').optional(),
  gtin: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidGtin(value), {
      message: 'Enter the 8, 12, 13 or 14 digit barcode number (check the digits)',
    }),
  mpn: z.string().trim().max(70, 'MPN must be at most 70 characters').optional(),
  condition: z.enum(['new', 'used', 'refurbished']).optional(),
});

// Product schema with refinement for create/update
export const productSchema = baseProductSchema.refine(
  (data) =>
    data.description_images.some(
      (img) => img.cover_image && (img.mediaType ?? 'image') === 'image'
    ),
  {
    message: 'At least one image must be marked as cover image',
    path: ['description_images'],
  }
);

export type CreateProductInput = z.infer<typeof productSchema>;

export const updateProductSchema = baseProductSchema.partial().extend({
  sku: z.number().int().min(1, 'SKU is required').optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
