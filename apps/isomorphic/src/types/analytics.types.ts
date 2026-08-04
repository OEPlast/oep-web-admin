/**
 * Types for the analytics endpoints that are still called.
 *
 * This file described 31 endpoints plus a 64-endpoint legacy annexe. Most of
 * those endpoints had already been replaced by the query engine, whose types
 * live in `analytics-query.types.ts`; the definitions here outlived their
 * callers and were removed. What remains is only what a live screen consumes:
 * three dashboard charts and four row listings.
 *
 * New analytics work belongs in `analytics-query.types.ts`, not here.
 */

// ============================================
// PAGINATION TYPE
// ============================================

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

// ============================================
// CHART RESPONSE TYPES (3 endpoints)
//
// Consumed by dashboard widgets that have not been migrated to the query
// engine. Each is rendered on the home page.
// ============================================

/**
 * Total Profit/Loss Chart (Line Chart with 3 metrics)
 * Time-series data showing revenue, expenses, and returns
 */
export interface ProfitLossChartData {
  date: string; // ISO date string (e.g., "2025-01-15")
  revenue: number;
  expenses: number;
  returns: number;
}

/**
 * Top Products by Revenue (Bar Chart)
 * Top N products sorted by revenue
 */
export interface TopProductsRevenueData {
  productId: string;
  productName: string;
  coverImage: string | null;
  revenue: number;
}

/**
 * Categories Performance (Bar Chart)
 * Revenue/sales by product category
 */
export interface CategoriesPerformanceData {
  categoryId: string;
  name: string;
  image: string;
  revenue: number;
  orders: number;
}

// ============================================
// TABLE RESPONSE TYPES (4 endpoints)
//
// Row listings that take a date range rather than metrics — they carry per-row
// detail (images, a secondary count) that a metric breakdown does not model.
// ============================================

/**
 * Orders Table
 * Paginated list of orders with filters
 */
export interface OrderTableRow {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[]; // Can be typed more specifically if needed
  products: { qty: number; _id: string }[];
}

export interface OrdersTableResponse {
  data: OrderTableRow[];
  pagination: PaginationMeta;
}

/**
 * Transactions Table
 * Paginated list of transactions with filters
 */
export interface TransactionTableRow {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface TransactionsTableResponse {
  data: TransactionTableRow[];
  pagination: PaginationMeta;
}

/**
 * Product Performance Table
 * Product-level metrics with pagination
 */
export interface ProductPerformanceRow {
  productId: string;
  productName: string;
  coverImage: string | null;
  revenue: number;
  unitsSold: number;
  averageRating: number;
  reviewCount: number;
}

export interface ProductPerformanceResponse {
  data: ProductPerformanceRow[];
  pagination: PaginationMeta;
}

/**
 * Reviews Table
 * Paginated reviews with filters
 */
export interface ReviewTableRow {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  reviewBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export interface ReviewsTableResponse {
  data: ReviewTableRow[];
  pagination: PaginationMeta;
}

// ============================================
// QUERY PARAMETER TYPES
// ============================================

/**
 * Common date range parameters
 */
export interface DateRangeParams {
  from: string; // ISO date string
  to: string; // ISO date string
}

/**
 * Chart-specific parameters (with grouping)
 */
export interface ChartParams extends DateRangeParams {
  groupBy?: 'days' | 'months' | 'years';
}

/**
 * Table-specific parameters (with pagination and sorting)
 */
export interface TableParams extends DateRangeParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Orders table filters
 */
export interface OrdersTableParams extends TableParams {
  status?: string;
}

/**
 * Transactions table filters
 */
export interface TransactionsTableParams extends TableParams {
  status?: string;
  method?: string;
}

/**
 * Reviews table filters
 */
export interface ReviewsTableParams extends TableParams {
  rating?: number;
  status?: string;
}

/**
 * Product performance filters
 */
export interface ProductPerformanceParams extends TableParams {
  category?: string;
  search?: string;
}

/**
 * Top products/coupons parameters
 */
export interface TopItemsParams extends DateRangeParams {
  limit?: number;
}
