// Logistics Configuration Types
// Aligned with backend: src/models/LogisticsConfig.ts

/**
 * City configuration with pricing and ETA
 */
export interface City {
  name: string;
  price?: number;
  etaDays?: number;
}

/**
 * Local Government Area (LGA) configuration with pricing and ETA
 */
export interface LGA {
  name: string;
  price?: number;
  etaDays?: number;
}

/**
 * State configuration with fallback pricing and nested locations
 */
export interface State {
  name: string;
  fallbackPrice?: number;
  fallbackEtaDays?: number;
  cities?: City[];
  lgas?: LGA[];
}

/**
 * Complete logistics configuration for a country
 * Matches backend LogisticsConfigType
 */
export interface LogisticsConfig {
  _id: string;
  countryCode: string;
  countryName: string;
  states: State[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Simplified country list item for list views
 */
export interface CountryListItem {
  _id: string;
  countryCode: string;
  countryName: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Input for creating a new logistics configuration
 * POST /admin/logistics/config
 */
export interface CreateConfigInput {
  countryCode: string;
  countryName: string;
  states: State[];
}

/**
 * Input for updating an existing logistics configuration
 * PATCH /admin/logistics/config/:id
 */
export interface UpdateConfigInput {
  countryCode?: string;
  countryName?: string;
  states?: State[];
}

/**
 * Input for creating an empty country (no states)
 * POST /admin/logistics/country/add
 */
export interface CreateEmptyCountryInput {
  countryCode: string;
  countryName: string;
}

/**
 * Destination for shipping quote calculation
 */
export interface ShippingDestination {
  countryName: string;
  stateName?: string;
  cityName?: string;
  lgaName?: string;
}

/**
 * Input for shipping quote request
 * POST /logistics/quote
 */
export interface QuoteInput {
  productId: string;
  quantity?: number;
  destination: ShippingDestination;
}

/**
 * Product shipping adjustments (from Product model)
 */
export interface ProductShippingAdjustments {
  addedCost: number;
  increaseCostBy: number;
  addedDays: number;
}

/**
 * Breakdown of shipping costs by location level
 */
export interface ShippingBreakdown {
  city?: number;
  lga?: number;
  state?: number;
  productAddedCost?: number;
  productIncreaseCostBy?: number;
}

/**
 * Quote result from shipping calculation
 * Response from POST /logistics/quote
 */
export interface QuoteResult {
  currency: string;
  basePrice: number;
  finalPrice: number;
  etaDays: number;
  productShippingAdjustments: ProductShippingAdjustments;
  breakdown: ShippingBreakdown;
}

/**
 * Cart item for shipping calculation
 */
export interface CartShippingItem {
  productId: string;
  quantity: number;
}

/**
 * Input for cart flat shipping calculation
 * POST /logistics/cart/flat-shipping
 */
export interface FlatShippingInput {
  items: CartShippingItem[];
  destination: {
    countryName: string;
    stateName: string;
    lgaName: string;
  };
}

/**
 * Response from cart flat shipping calculation
 */
export interface FlatShippingResult {
  amount: number;
}

// ============================================================================
// Form Data Types (for React Hook Form + Zod)
// ============================================================================

/**
 * City form data (used in dynamic forms)
 */
export interface CityFormData {
  name: string;
  code?: string;
  price?: number;
  etaDays?: number;
}

/**
 * LGA form data (used in dynamic forms)
 */
export interface LGAFormData {
  name: string;
  code?: string;
  price?: number;
  etaDays?: number;
}

/**
 * State form data (used in dynamic forms)
 */
export interface StateFormData {
  name: string;
  code: string;
  fallbackPrice: number;
  fallbackEtaDays: number;
  cities: CityFormData[];
  lgas: LGAFormData[];
}

/**
 * Full logistics config form data
 */
export interface LogisticsFormData {
  countryCode: string;
  countryName: string;
  states: StateFormData[];
}

/**
 * Empty country form data
 */
export interface EmptyCountryFormData {
  countryCode: string;
  countryName: string;
}

// ============================================================================
// Location Tree (Public API)
// ============================================================================

/**
 * Simplified location structure without pricing (public)
 */
export interface PublicLocation {
  name: string;
}

/**
 * Public state with nested locations (no pricing)
 */
export interface PublicState {
  name: string;
  cities: PublicLocation[];
  lgas: PublicLocation[];
}

/**
 * Public country with nested states (no pricing)
 * Response from GET /logistics/locations-tree
 */
export interface PublicCountry {
  countryCode: string;
  countryName: string;
  states: PublicState[];
}

/**
 * Location tree response type
 */
export type LocationTree = PublicCountry[];

// ============================================================================
// API Response Wrapper
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  message: string;
  code: number;
  data: T | null;
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedApiResponse<T> {
  message: string;
  code: number;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
