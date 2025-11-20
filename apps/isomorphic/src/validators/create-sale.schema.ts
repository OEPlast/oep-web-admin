import { z } from 'zod';

const variantSchema = z
  .object({
    attributeName: z.string().nullable(),
    attributeValue: z.string().nullable(),
    discount: z
      .number()
      .min(0, { message: 'Discount must be a positive number.' }),
    maxBuys: z.number().min(0).optional(), // Optional because it's only for 'Limited' type
    boughtCount: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      const { attributeName, attributeValue } = data;
      const bothNull = attributeName === null && attributeValue === null;
      const bothString =
        typeof attributeName === 'string' && typeof attributeValue === 'string';
      // Allow 'All' for attributeName and attributeValue to be valid without the other being a string
      if (attributeName === 'All' && attributeValue === 'All') return true;
      if (
        attributeName === 'All' &&
        typeof attributeValue === 'string' &&
        attributeValue !== 'All'
      )
        return false; // If name is All, value must be All or not set for specific product attributes
      if (
        attributeValue === 'All' &&
        typeof attributeName === 'string' &&
        attributeName !== 'All'
      )
        return false; // If value is All, name must be All

      return bothNull || bothString;
    },
    {
      message:
        "Attribute Name and Attribute Value must both be selected or both be set to 'All', or neither selected if not applicable.",
      path: ['attributeValue'], // Or a more general path if appropriate
    }
  );

export const createSalesSchema = z
  .object({
    title: z.string().min(1, { message: 'Title is required.' }),
    product: z.string().min(1, { message: 'Product is required.' }),
    isActive: z.boolean().default(true).optional(),
    isHot: z.boolean().default(false).optional(),
    createdBy: z.string().optional(),
    updatedBy: z.string().optional(),
    type: z.enum(['Flash',
      
      'Limited',
      
      'Normal']),
    startDate: z.date({ required_error: 'Start date is required.' }),
    endDate: z.date({ required_error: 'End date is required.' }),
    deleted: z.boolean(),
    variants: z
      .array(variantSchema)
      .min(1, { message: 'At least one variant is required.' }),
  })
  .superRefine((data, ctx) => {
    
    if (data.type === 'Limited') {
      // For 'Limited' sales, ensure maxBuys is set for all variants
      data.variants.forEach((variant, index) => {
        if (
          variant.maxBuys === undefined ||
          variant.maxBuys === null ||
          variant.maxBuys < 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Max Buys is required and must be non-negative for each variant in a Limited sale.',
            path: [`variants.${index}.maxBuys`],
          });
        }
      });
    }
      
  });

export type CreateSalesInput = z.infer<typeof createSalesSchema>;
