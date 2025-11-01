/**
 * Sales Type Definitions
 * Based on backend Sales model and API responses
 */

// Sale type enum
export type SaleType = 'Flash' | 'Limited' | 'Normal';

// Sale variant interface
export interface SaleVariant {
  _id?: string;
  attributeName: string | null;
  attributeValue: string | null;
  discount: number;
  amountOff: number;
  maxBuys: number;
  boughtCount: number;
}

// Product reference in sale
export interface SaleProductRef {
  _id: string;
  name: string;
  slug?: string;
  coverImage?: string;
  image?: string;
  stock?: number;
  category?: {
    _id: string;
    name: string;
  };
  subCategories?: {
    _id: string;
    name: string;
  };
  attributes?: {
    name: string;
    children: {
      name: string;
      price: number;
      discount: number;
      stock: number;
      image: string;
    }[];
  }[];
  [key: string]: unknown;
}

// User reference in sale
export interface SaleUserRef {
  _id: string;
  name: string;
  email: string;
}

// Main Sale interface (from backend aggregation)
export interface Sale {
  _id: string;
  title: string;
  type: SaleType;
  isActive: boolean;
  isHot: boolean;
  deleted?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  product: SaleProductRef;
  createdBy?: SaleUserRef;
  updatedBy?: SaleUserRef;
  campaign?: string; // Campaign ID
  variants: SaleVariant[];
}

// Paginated sales response
export interface PaginatedSales {
  sales: Sale[];
  page: number;
  total: number;
}

// Create sale input
export interface CreateSaleInput {
  title?: string;
  product: string; // Product ID
  type?: SaleType;
  isActive?: boolean;
  isHot?: boolean;
  deleted?: boolean;
  campaign?: string; // Campaign ID (optional)
  startDate?: Date | string;
  endDate?: Date | string;
  variants: Array<{
    attributeName: string | null;
    attributeValue: string | null;
    discount: number;
    amountOff: number;
    maxBuys: number;
    boughtCount?: number;
  }>;
}

// Update sale input
export interface UpdateSaleInput {
  title?: string;
  product?: string;
  type?: SaleType;
  isActive?: boolean;
  isHot?: boolean;
  deleted?: boolean;
  campaign?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  variants?: Array<{
    attributeName?: string | null;
    attributeValue?: string | null;
    discount?: number;
    amountOff?: number;
    maxBuys?: number;
    boughtCount?: number;
  }>;
}

// Sale usage response
export interface SaleUsage {
  variants: Array<{
    maxBuys: number;
    boughtCount: number;
  }>;
  isActive: boolean;
  endDate?: Date | string | null;
}

// Sales filters
export interface SalesFilters {
  page?: number;
  limit?: number;
  type?: SaleType;
  isActive?: boolean;
  deleted?: boolean;
  search?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

// Sale list item (table display)
export interface SaleListItem extends Sale {
  // Add computed fields if needed
  totalMaxBuys: number;
  totalBoughtCount: number;
  isExpired: boolean;
  isExhausted: boolean;
}
