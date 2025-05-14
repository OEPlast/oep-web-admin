import { z } from 'zod';

const variantSchema = z
  .object({
    attributeName: z.string().nullable(),
    attributeValue: z.string().nullable(),
    discount: z
      .number()
      .min(0, { message: 'Discount must be a positive number.' }),
    maxBuys: z.number().min(0),
    boughtCount: z.number().min(0),
    limit: z.number().min(1, { message: 'Limit must be at least 1.' }),
  })
  .refine(
    (data) => {
      const { attributeName, attributeValue } = data;
      const bothNull = attributeName === null && attributeValue === null;
      const bothString =
        typeof attributeName === 'string' && typeof attributeValue === 'string';
      return bothNull || bothString;
    },
    {
      message:
        'attributeName and attributeValue must both be null or both be strings.',
      path: ['attributeValue'],
    }
  );

export const createSalesSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }),
  product: z.string().min(1, { message: 'Product is required.' }),
  isActive: z.boolean(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  type: z.enum(['Flash', 'Limited', 'Normal']),
  campaign: z.string().optional(),
  limit: z.number().min(1),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
  deleted: z.boolean(),
  variants: z
    .array(variantSchema)
    .min(1, { message: 'At least one variant is required.' }),
});

export type CreateSalesInput = z.infer<typeof createSalesSchema>;
