/**
 * Analytics API Response Types
 * 
 * Type definitions for all 31 new analytics endpoints.
 * Maps directly to backend service return types.
 */

// ============================================
// PAGINATION TYPE
// ============================================

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

// ============================================
// OVERVIEW RESPONSE TYPES (7 endpoints)
// ============================================

export interface SalesOverviewResponse {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  comparisonPeriod: {
    revenue: number;
    orders: number;
    percentageChange: number;
  };
}

export interface OrdersOverviewResponse {
  totalOrders: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  failed: number;
  comparisonPeriod: {
    orders: number;
    percentageChange: number;
  };
}

export interface TransactionsOverviewResponse {
  totalTransactions: number;
  pending: number;
  completed: number;
  failed: number;
  totalAmount: number;
}

export interface UsersOverviewResponse {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  comparisonPeriod: {
    users: number;
    percentageChange: number;
  };
}

export interface ProductsOverviewResponse {
  totalProducts: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
}

export interface ReviewsOverviewResponse {
  totalReviews: number;
  averageRating: number;
  positiveReviews: number;
  negativeReviews: number;
}

export interface CouponsOverviewResponse {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
}

// ============================================
// CHART RESPONSE TYPES (14 endpoints)
// ============================================

/**
 * Revenue & Expense Chart (Area Chart)
 * Time-series data with revenue and expense metrics
 */
export interface RevenueExpenseChartData {
  date: string; // ISO date string (e.g., "2025-01-15")
  revenue: number;
  expense: number;
}

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
 * Orders Trend Chart (Line/Area Chart)
 * Time-series order count data
 */
export interface OrdersTrendData {
  date: string;
  count: number;
}

/**
 * Transactions Trend Chart (Line/Area Chart)
 * Time-series transaction count data
 */
export interface TransactionsTrendData {
  date: string;
  count: number;
}

/**
 * Customer Acquisition Chart (Line Chart)
 * Time-series new user registrations
 */
export interface CustomerAcquisitionData {
  date: string;
  count: number;
}

/**
 * Order Status Distribution (Pie Chart)
 * Count of orders by status
 */
export interface OrderStatusDistributionData {
  status: string; // e.g., "Completed", "Pending"
  count: number;
}

/**
 * Transaction Status Distribution (Pie Chart)
 * Count of transactions by status
 */
export interface TransactionStatusDistributionData {
  date: string;
  pending: number;
  completed: number;
  failed: number;
  cancelled: number;
  refunded: number;
  partially_refunded: number;
}

/**
 * Rating Distribution (Bar Chart)
 * Count of reviews by star rating (1-5)
 */
export interface RatingDistributionData {
  rating: number; // 1, 2, 3, 4, or 5
  count: number;
}

/**
 * Review Sentiment Chart (Line Chart)
 * Time-series positive vs negative review counts
 */
export interface ReviewSentimentData {
  month: string;
  positive: number;
  negative: number;
}

/**
 * Coupon Redemption Trend (Line Chart)
 * Time-series coupon usage data
 */
export interface CouponRedemptionTrendData {
  date: string;
  count: number;
}

/**
 * Payment Methods Distribution (Pie Chart)
 * Transaction count by payment method
 */
export interface PaymentMethodsData {
  name: string; // e.g., "paystack", "original_payment"
  value: number;
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

/**
 * User Demographics (WorldMap or Pie Chart)
 * User distribution by country
 */
export interface UserDemographicsData {
  country: string;
  count: number;
}

/**
 * Coupon Type Distribution (Pie Chart)
 * Coupon usage by type
 */
export interface CouponTypeDistributionData {
  type: string; // e.g., "Percentage", "Fixed"
  count: number;
}

// ============================================
// TABLE RESPONSE TYPES (10 endpoints)
// ============================================

/**
 * Sales by Category Table
 * Category-wise sales breakdown with pagination
 */
export interface SalesByCategoryRow {
  category: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface SalesByCategoryResponse {
  data: SalesByCategoryRow[];
  pagination: PaginationMeta;
}

/**
 * Top Selling Products Table
 * Best-selling products by quantity
 */
export interface TopSellingProductRow {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

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
 * Top Customers Table
 * Customers ranked by total spend
 */
export interface TopCustomerRow {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalSpent: number;
  orderCount: number;
}

export interface TopCustomersResponse {
  data: TopCustomerRow[];
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
  quantitySold: number;
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

/**
 * Top Coupons Table
 * Coupons ranked by redemption count
 */
export interface TopCouponRow {
  couponCode: string;
  couponType: string;
  discountValue: number;
  redemptionCount: number;
  totalDiscountGiven: number;
}

export interface TopCouponsResponse {
  data: TopCouponRow[];
  pagination: PaginationMeta;
}

/**
 * Most Wishlisted Products
 * Products by wishlist frequency
 */
export interface MostWishlistedProductRow {
  productId: string;
  productName: string;
  coverImage: string | null;
  wishlistCount: number;
}

/**
 * Most Reviewed Products
 * Products by review count with average rating
 */
export interface MostReviewedProductRow {
  productId: string;
  productName: string;
  coverImage: string | null;
  reviewCount: number;
  averageRating: number;
}

/**
 * Low Stock Products (Stock Report)
 * Products where stock <= lowStockThreshold
 */
export interface LowStockProduct {
  productId: string;
  name: string;
  sku: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  coverImage: string | null;
}

export interface LowStockProductsResponse {
  data: LowStockProduct[];
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
  to: string;   // ISO date string
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
}

/**
 * Top products/coupons parameters
 */
export interface TopItemsParams extends DateRangeParams {
  limit?: number;
}

// ============================================
// LEGACY ANALYTICS TYPES (64 endpoints)
// ============================================

/**
 * Legacy time-series data item
 * Used by all ByDays/ByMonths/ByYears endpoints
 */
export interface LegacyTimeSeriesDataPoint {
  year: number;
  month?: number; // Present in ByDays and ByMonths, not in ByYears
  day?: number; // Present only in ByDays
  count: number; // Common field across all time-series endpoints
  totalAmount?: number; // Used in transaction endpoints
  totalDiscount?: number; // Used in sales discount endpoints
  averageRating?: number; // Used in review rate endpoints
  positive?: number; // Used in review mood endpoints
  negative?: number; // Used in review mood endpoints
  neutral?: number; // Used in review mood endpoints
  totalRevenue?: number; // Used in revenue endpoints
  totalItems?: number; // Used in cart endpoints
}

/**
 * Standard response format for all legacy time-series endpoints
 */
export interface LegacyTimeSeriesResponse {
  data: LegacyTimeSeriesDataPoint[];
  total: number;
}

// ============================================
// STANDALONE LEGACY ENDPOINT TYPES
// ============================================

/**
 * Seller Statistics Response
 * GET /api/admin/analytics/seller-statistics
 */
export interface SellerStatisticsResponse {
  revenue: number;
  profit: number;
}

/**
 * Total Sales Response
 * GET /api/admin/analytics/total-sales
 */
export interface TotalSalesResponse {
  revenue: number;
  profit: number;
  sales?: number; // Total sales count
}

/**
 * Chart Data Response (for custom metric charting)
 * GET /api/admin/analytics/chart-data
 */
export interface ChartDataPoint {
  date: string; // ISO date string
  value: number;
}

export interface ChartDataResponse {
  data: ChartDataPoint[];
}

/**
 * Order vs Returns Response
 * GET /api/admin/analytics/order-vs-returns
 */
export interface OrderVsReturnsResponse {
  orders: number;
  returns: number;
  returnRate: number; // Percentage
}

/**
 * Range Count Response
 * GET /api/admin/analytics/range-count
 */
export interface RangeCountResponse {
  count: number;
}

/**
 * Paginated Statistics Row
 * Used for getPaginatedStatisticsDays/Weeks/Months/Years
 */
export interface PaginatedStatisticsRow {
  date: Date;
  type: string;
  totalRevenue: number;
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  totalCoupons: number;
  [key: string]: any; // Allow for additional dynamic fields
}

export interface PaginatedStatisticsResponse {
  data: PaginatedStatisticsRow[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
}

// ============================================
// LEGACY QUERY PARAMETER TYPES
// ============================================

/**
 * Legacy time-series parameters
 * Used for endpoints with ByDays/ByMonths/ByYears variants
 */
export interface LegacyTimeSeriesParams {
  from: string; // ISO date string
  to: string;   // ISO date string
  groupBy: 'days' | 'weeks' | 'months' | 'years'; // Client-side routing param
}

/**
 * Chart data parameters
 */
export interface ChartDataParams extends DateRangeParams {
  metric: string; // The metric to chart (e.g., 'totalRevenue', 'totalOrders')
}

/**
 * Paginated statistics parameters
 */
export interface PaginatedStatisticsParams {
  from: string;
  to: string;
  page?: number;
  limit?: number;
  groupBy: 'days' | 'weeks' | 'months' | 'years';
}

// ============================================
// LEGACY ENDPOINT CATEGORIES
// ============================================

/**
 * Legacy analytics endpoints are organized into:
 * 
 * 1. **Standalone Endpoints** (5 endpoints):
 *    - getSellerStatistics
 *    - getTotalSales
 *    - getChartData
 *    - getOrderVsReturns
 *    - getRangeCount
 * 
 * 2. **Paginated Statistics** (4 endpoints with groupBy):
 *    - getPaginatedStatisticsDays
 *    - getPaginatedStatisticsWeeks
 *    - getPaginatedStatisticsMonths
 *    - getPaginatedStatisticsYears
 * 
 * 3. **Time-Series Metrics** (19 metric groups × 3 time periods = 57 endpoints):
 *    Each group has ByDays, ByMonths, ByYears variants:
 *    - WishlistFrequency
 *    - Orders
 *    - OrderCancelled
 *    - ShipmentsDelivered
 *    - OrderReturned
 *    - OrderFailed
 *    - ShipmentsInWarehouse
 *    - Transactions
 *    - TotalTransactions
 *    - UserJoiningRate
 *    - CouponRedemption
 *    - Reviews
 *    - ReviewRate
 *    - ReviewMood
 *    - Revenue
 *    - ProductsAdded
 *    - CurrentCarts
 *    - Sales
 *    - SalesDiscountTotal
 * 
 * Total: 5 + 4 + 57 = 66 endpoints (note: 2 more than initially counted)
 */
