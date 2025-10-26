/**
 * Transaction Management Types
 * Comprehensive TypeScript interfaces for admin transaction system
 */

// Transaction Status
export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

// Payment Gateway
export type TransactionGateway = 'paystack' | 'stripe' | 'flutterwave' | 'manual';

// Payment Method
export type PaymentMethod =
  | 'stripe'
  | 'paystack'
  | 'flutterwave'
  | 'bank_transfer'
  | 'cash_on_delivery';

// Refund Status
export type RefundStatus = 'pending' | 'completed' | 'failed';

// Refund Interface
export interface Refund {
  refundId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  refundDate: string;
  gatewayRefundId?: string;
}

// Transaction Fees
export interface TransactionFees {
  gatewayFee: number;
  processingFee: number;
  totalFees: number;
}

// Customer Information
export interface TransactionCustomerInfo {
  email: string;
  phone?: string;
  name: string;
}

// Billing Address
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// Gateway Response
export interface GatewayResponse {
  transactionReference?: string;
  gatewayTransactionId?: string;
  responseCode?: string;
  responseMessage?: string;
  metadata?: Record<string, any>;
}

// User reference in transactions (when populated)
export interface TransactionUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

// Shipping Address
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
}

// Order reference in transactions (when populated)
export interface TransactionOrder {
  _id: string;
  total: number;
  status: string;
  deliveryStatus: string;
  products?: any[];
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  isPaid?: boolean;
}

// Main Transaction Interface
export interface Transaction {
  _id: string;
  orderId: string | TransactionOrder;
  userId: string | TransactionUser;
  reference: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentGateway: TransactionGateway;
  status: TransactionStatus;
  channel?: string;
  accessCode?: string;
  paymentDate: string;
  paidAt?: string;
  gatewayResponse?: GatewayResponse;
  refunds: Refund[];
  fees: TransactionFees;
  customerInfo: TransactionCustomerInfo;
  billingAddress?: BillingAddress;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Populated fields (from aggregation)
  user?: TransactionUser;
  order?: TransactionOrder;
}

// Filters for transaction queries
export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  paymentGateway?: TransactionGateway;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  reference?: string;
  transactionId?: string;
}

// Pagination metadata
export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Paginated transaction response
export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: TransactionPagination;
}

// Transaction statistics
export interface TransactionStatistics {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  cancelled: number;
  refunded: number;
  partially_refunded: number;
  totalRevenue: number;
  totalRefunded: number;
  averageTransactionValue: number;
  transactionsByGateway: { [key: string]: number };
  transactionsByMethod: { [key: string]: number };
  recentTransactions: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

// Refund request
export interface RefundRequest {
  amount: number;
  reason: string;
}

// API Response types
export interface TransactionResponse {
  message: string;
  data: Transaction | null;
  code: number;
}

export interface TransactionsListResponse {
  message: string;
  data: Transaction[] | null;
  code: number;
  meta?: TransactionPagination;
}

export interface StatisticsResponse {
  message: string;
  data: TransactionStatistics | null;
  code: number;
}
