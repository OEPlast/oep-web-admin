import { z } from 'zod';

// ============================================================================
// City Schema
// ============================================================================

export const citySchema = z.object({
  name: z
    .string()
    .min(1, 'City name is required')
    .trim()
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be non-negative')
    .optional(),
  etaDays: z
    .number({ invalid_type_error: 'ETA days must be a number' })
    .int('ETA days must be an integer')
    .min(0, 'ETA days must be non-negative')
    .optional(),
});

// ============================================================================
// LGA Schema
// ============================================================================

export const lgaSchema = z.object({
  name: z
    .string()
    .min(1, 'LGA name is required')
    .trim()
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be non-negative')
    .optional(),
  etaDays: z
    .number({ invalid_type_error: 'ETA days must be a number' })
    .int('ETA days must be an integer')
    .min(0, 'ETA days must be non-negative')
    .optional(),
});

// ============================================================================
// State Schema
// ============================================================================

export const stateSchema = z.object({
  name: z
    .string()
    .min(1, 'State name is required')
    .trim()
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  fallbackPrice: z
    .number({ invalid_type_error: 'Fallback price must be a number' })
    .min(0, 'Fallback price must be non-negative')
    .default(0),
  fallbackEtaDays: z
    .number({ invalid_type_error: 'Fallback ETA must be a number' })
    .int('Fallback ETA must be an integer')
    .min(0, 'Fallback ETA must be non-negative')
    .default(0),
  cities: z.array(citySchema).default([]),
  lgas: z.array(lgaSchema).default([]),
});

// ============================================================================
// Full Logistics Config Schema
// ============================================================================

export const logisticsConfigSchema = z.object({
  countryCode: z
    .string()
    .min(2, 'Country code must be 2-3 characters')
    .max(3, 'Country code must be at most 3 characters')
    .trim()
    .toUpperCase(),
  countryName: z
    .string()
    .min(2, 'Country name is required')
    .trim()
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
  states: z.array(stateSchema).default([]),
});

// ============================================================================
// Empty Country Schema
// ============================================================================

export const emptyCountrySchema = z.object({
  countryCode: z
    .string()
    .min(2, 'Country code must be 2-3 characters')
    .max(3, 'Country code must be at most 3 characters')
    .trim()
    .toUpperCase(),
  countryName: z
    .string()
    .min(2, 'Country name is required')
    .trim()
    .transform((val) => val.charAt(0).toUpperCase() + val.slice(1)),
});

// ============================================================================
// Quote Input Schema
// ============================================================================

export const quoteInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .optional()
    .default(1),
  destination: z.object({
    countryName: z.string().min(1, 'Country name is required'),
    stateName: z.string().optional(),
    cityName: z.string().optional(),
    lgaName: z.string().optional(),
  }),
});

// ============================================================================
// Flat Shipping Input Schema
// ============================================================================

export const flatShippingInputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
  destination: z.object({
    countryName: z.string().min(1, 'Country name is required'),
    stateName: z.string().min(1, 'State name is required'),
    lgaName: z.string().min(1, 'LGA name is required'),
  }),
});

// ============================================================================
// Type Inference
// ============================================================================

export type CityFormData = z.infer<typeof citySchema>;
export type LGAFormData = z.infer<typeof lgaSchema>;
export type StateFormData = z.infer<typeof stateSchema>;
export type LogisticsConfigFormData = z.infer<typeof logisticsConfigSchema>;
export type EmptyCountryFormData = z.infer<typeof emptyCountrySchema>;
export type QuoteInputFormData = z.infer<typeof quoteInputSchema>;
export type FlatShippingInputFormData = z.infer<typeof flatShippingInputSchema>;
