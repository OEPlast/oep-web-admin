import { z } from 'zod';

// Applies To schema for targeting specific products/categories
const appliesToSchema = z
  .object({
    scope: z.enum(['order', 'product', 'category'], {
      required_error: 'Scope is required',
    }),
    productIds: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // If scope is 'product', productIds must be provided and not empty
      if (data.scope === 'product') {
        return data.productIds && data.productIds.length > 0;
      }
      // If scope is 'category', categoryIds must be provided and not empty
      if (data.scope === 'category') {
        return data.categoryIds && data.categoryIds.length > 0;
      }
      // For 'order' scope, no additional IDs are required
      return true;
    },
    {
      message:
        'Product IDs are required when scope is "product", and Category IDs are required when scope is "category".',
      path: ['productIds'],
    }
  );

// Main coupon schema
export const createCouponSchema = z
  .object({
    // Coupon Code
    coupon: z
      .string()
      .min(3, { message: 'Coupon code must be at least 3 characters.' })
      .max(50, { message: 'Coupon code must not exceed 50 characters.' })
      .regex(/^[A-Z0-9_-]+$/, {
        message:
          'Coupon code must contain only uppercase letters, numbers, hyphens, and underscores.',
      }),

    // Coupon Type
    couponType: z.enum(
      ['one-off', 'one-off-user', 'one-off-for-one-person', 'normal'],
      {
        required_error: 'Coupon type is required.',
      }
    ),

    // Discount Value
    discount: z
      .number({ required_error: 'Discount value is required.' })
      .positive({ message: 'Discount must be a positive number.' }),

    // Discount Type
    discountType: z
      .enum(['percentage', 'fixed'], {
        required_error: 'Discount type is required.',
      })
      .default('percentage'),

    // Date Range
    startDate: z.date({ required_error: 'Start date is required.' }),
    endDate: z.date({ required_error: 'End date is required.' }),

    // Status
    active: z.boolean().default(true),

    // Usage Limits
    maxUsage: z
      .number()
      .int({ message: 'Max usage must be an integer.' })
      .positive({ message: 'Max usage must be a positive number.' })
      .nullable()
      .optional(),

    maxUsagePerUser: z
      .number()
      .int({ message: 'Max usage per user must be an integer.' })
      .positive({ message: 'Max usage per user must be a positive number.' })
      .nullable()
      .optional(),

    // Minimum Order Value
    minOrderValue: z
      .number()
      .min(0, { message: 'Minimum order value cannot be negative.' })
      .optional(),

    // Applies To (Product/Category targeting)
    appliesTo: appliesToSchema.optional(),

    // Stackable with other coupons
    stackable: z.boolean().default(false).optional(),

    // Allowed User (for one-off-for-one-person type)
    allowedUser: z.string().nullable().optional(),

    // Notes
    notes: z
      .string()
      .max(500, { message: 'Notes must not exceed 500 characters.' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validate end date is after start date
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date.',
        path: ['endDate'],
      });
    }

    // Validate percentage discount doesn't exceed 100%
    if (data.discountType === 'percentage' && data.discount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount cannot exceed 100%.',
        path: ['discount'],
      });
    }

    // Validate percentage discount is at least 0.01%
    if (data.discountType === 'percentage' && data.discount < 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount must be at least 0.01%.',
        path: ['discount'],
      });
    }

    // Validate fixed discount is reasonable (at least 0.01)
    if (data.discountType === 'fixed' && data.discount < 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fixed discount must be at least 0.01.',
        path: ['discount'],
      });
    }

    // For one-off-for-one-person, allowedUser must be provided
    if (data.couponType === 'one-off-for-one-person' && !data.allowedUser) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Allowed user must be specified for "one-off-for-one-person" coupon type.',
        path: ['allowedUser'],
      });
    }

    // For one-off coupons, maxUsage should be 1 or null
    if (data.couponType === 'one-off' && data.maxUsage && data.maxUsage !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'One-off coupons should have maxUsage set to 1 or left unset.',
        path: ['maxUsage'],
      });
    }

    // For one-off-user coupons, maxUsagePerUser should be 1 or null
    if (
      data.couponType === 'one-off-user' &&
      data.maxUsagePerUser &&
      data.maxUsagePerUser !== 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'One-off-user coupons should have maxUsagePerUser set to 1 or left unset.',
        path: ['maxUsagePerUser'],
      });
    }

    // Validate maxUsagePerUser doesn't exceed maxUsage
    if (
      data.maxUsage &&
      data.maxUsagePerUser &&
      data.maxUsagePerUser > data.maxUsage
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max usage per user cannot exceed total max usage.',
        path: ['maxUsagePerUser'],
      });
    }
  });

// Update coupon schema (all fields optional)
export const updateCouponSchema = z
  .object({
    coupon: z
      .string()
      .min(3, { message: 'Coupon code must be at least 3 characters.' })
      .max(50, { message: 'Coupon code must not exceed 50 characters.' })
      .regex(/^[A-Z0-9_-]+$/, {
        message:
          'Coupon code must contain only uppercase letters, numbers, hyphens, and underscores.',
      })
      .optional(),
    couponType: z
      .enum(['one-off', 'one-off-user', 'one-off-for-one-person', 'normal'])
      .optional(),
    discount: z
      .number()
      .positive({ message: 'Discount must be a positive number.' })
      .optional(),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    active: z.boolean().optional(),
    maxUsage: z
      .number()
      .int({ message: 'Max usage must be an integer.' })
      .positive({ message: 'Max usage must be a positive number.' })
      .nullable()
      .optional(),
    maxUsagePerUser: z
      .number()
      .int({ message: 'Max usage per user must be an integer.' })
      .positive({ message: 'Max usage per user must be a positive number.' })
      .nullable()
      .optional(),
    minOrderValue: z
      .number()
      .min(0, { message: 'Minimum order value cannot be negative.' })
      .optional(),
    appliesTo: appliesToSchema.optional(),
    stackable: z.boolean().optional(),
    allowedUser: z.string().nullable().optional(),
    notes: z
      .string()
      .max(500, { message: 'Notes must not exceed 500 characters.' })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validate end date is after start date (only if both are provided)
    if (data.endDate && data.startDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date.',
        path: ['endDate'],
      });
    }

    // Validate percentage discount doesn't exceed 100%
    if (
      data.discountType === 'percentage' &&
      data.discount &&
      data.discount > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount cannot exceed 100%.',
        path: ['discount'],
      });
    }

    // Validate percentage discount is at least 0.01%
    if (
      data.discountType === 'percentage' &&
      data.discount &&
      data.discount < 0.01
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount must be at least 0.01%.',
        path: ['discount'],
      });
    }

    // Validate fixed discount is reasonable (at least 0.01)
    if (
      data.discountType === 'fixed' &&
      data.discount &&
      data.discount < 0.01
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fixed discount must be at least 0.01.',
        path: ['discount'],
      });
    }

    // Validate maxUsagePerUser doesn't exceed maxUsage
    if (
      data.maxUsage &&
      data.maxUsagePerUser &&
      data.maxUsagePerUser > data.maxUsage
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max usage per user cannot exceed total max usage.',
        path: ['maxUsagePerUser'],
      });
    }
  });

// Type inference
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

// Export for form default values
export const defaultCouponValues: Partial<CreateCouponInput> = {
  active: true,
  discountType: 'percentage',
  stackable: false,
  couponType: 'normal',
};
