// API endpoints for use with apiClient (which already has baseURL configured)
// No need to prefix with BASE_URL since axios instance handles that
export const api = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    providerLogin: '/auth/login/provider',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyOtp: '/auth/verifyAccount',
    resendOtp: '/auth/resendVerifyAccountOtp',
    changePassword: '/auth/changePassword',
    requestResetPasswordCode: '/auth/requestResetPasswordCode',
    resetPasswordByCode: '/auth/resetPasswordByCode',
    passwordAndProviderStatus: '/auth/passwordAndProviderStatus',
    setPassword: '/auth/setPassword',
  },

  // User endpoints
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    changePassword: '/user/password/change',
    permissions: '/admin/users/permissions',
    // Address endpoints
    addresses: '/user/address/all',
    addAddress: '/user/address',
    updateAddress: (addressId: string) => `/user/address/${addressId}`,
    deleteAddress: (addressId: string) => `/user/address/${addressId}`,
  },

  // Product endpoints
  products: {
    list: '/admin/products/all', // Admin endpoint with pagination
    listEnhanced: '/admin/products/all-enhanced', // Admin endpoint with rating
    byId: (id: string) => `/admin/products/${id}`,
    create: '/admin/products/create',
    update: (id: string) => `/admin/products/${id}`,
    delete: (id: string) => `/admin/products/${id}`,
    duplicate: (id: string) => `/admin/products/duplicate/${id}`,
    checkSku: (sku: string) => `/admin/products/does-sku-exist/${sku}`,
    checkSlug: '/admin/products/check-slug', // Check if slug is available
    updateCoverImage: (id: string) => `/admin/products/coverImage/update/${id}`,
    addTags: (id: string) => `/admin/products/${id}/tags`,
    removeTag: (id: string, tag: string) => `/admin/products/${id}/tags/${tag}`,
    addSpecifications: (id: string) => `/admin/products/${id}/specifications`,
    removeSpecification: (id: string) => `/admin/products/${id}/specifications`,
    byCategory: (categoryId: string) => `/products/category/${categoryId}`,
    search: '/admin/products/all', // Use getAllProducts with search param
    featured: '/products/featured',
    newArrivals: '/products/new-arrivals',
  },

  // Category endpoints
  categories: {
    list: '/admin/category/all',
    getList: '/admin/category/get-list', // All categories for dropdowns (no pagination)
    byId: (id: string) => `/admin/category/${id}`,
    create: '/admin/category/create',
    update: (id: string) => `/admin/category/${id}`,
    delete: (id: string) => `/admin/category/${id}`,
  },

  // Order endpoints
  orders: {
    list: '/admin/orders', // List with filters & pagination
    byId: (id: string) => `/admin/orders/${id}`, // Get single order with full data
    updateStatus: (id: string) => `/admin/orders/${id}/status`,
    updatePaymentStatus: (id: string) => `/admin/orders/${id}/payment-status`,
    updateTracking: (id: string) => `/admin/orders/${id}/tracking`,
    updateNotes: (id: string) => `/admin/orders/${id}/notes`,
    refund: (id: string) => `/admin/orders/${id}/refund`,
    cancel: (id: string) => `/admin/orders/${id}/cancel`,
    resendNotification: (id: string) => `/admin/orders/${id}/resend-notification`,
    statistics: '/admin/orders/statistics',
    bulkUpdate: '/admin/orders/bulk-update',
    export: '/admin/orders/export',
  },

  // Customer endpoints
  customers: {
    list: '/admin/customers',
    byId: (id: string) => `/admin/customers/${id}`,
    statistics: '/admin/customers/statistics',
  },

  // Inventory endpoints
  inventory: {
    list: '/admin/inventory',
    byId: (id: string) => `/admin/inventory/${id}`,
    update: (id: string) => `/admin/inventory/${id}`,
    lowStock: '/admin/inventory/low-stock',
  },

  // Analytics endpoints
  analytics: {
    dashboard: '/admin/analytics/dashboard',
    sales: '/admin/analytics/sales',
    revenue: '/admin/analytics/revenue',
    products: '/admin/analytics/products',
  },

  // Banner/Marketing endpoints
  banners: {
    list: '/admin/banners',
    byId: (id: string) => `/admin/banners/${id}`,
    create: '/admin/banners',
    update: (id: string) => `/admin/banners/${id}`,
    delete: (id: string) => `/admin/banners/${id}`,
  },

  // Review endpoints
  reviews: {
    list: '/admin/reviews',
    byProduct: (productId: string) => `/products/${productId}/reviews`,
    approve: (reviewId: string) => `/admin/reviews/${reviewId}/approve`,
    delete: (reviewId: string) => `/admin/reviews/${reviewId}`,
  },

  // Settings endpoints
  settings: {
    general: '/admin/settings/general',
    shipping: '/admin/settings/shipping',
    payment: '/admin/settings/payment',
    notifications: '/admin/settings/notifications',
  },

  // File upload endpoints
  fileUpload: {
    single: '/files/upload/single',
    multiple: '/files/upload/multiple',
    byCategory: (category: string) => `/files/category/${category}`,
  },

  // Role Management endpoints
  roles: {
    list: '/admin/roles',
    byId: (id: string) => `/admin/roles/${id}`,
    create: '/admin/roles',
    update: (id: string) => `/admin/roles/${id}`,
    delete: (id: string) => `/admin/roles/${id}`,
    toggleStatus: (id: string) => `/admin/roles/${id}/toggle-status`,
  },

  // Staff Management endpoints
  staff: {
    list: '/admin/users/staff',
    changeRole: (id: string) => `/admin/roles/users/${id}/role`,
    assignRoles: (id: string) => `/admin/roles/users/${id}/assign-roles`,
    editRoles: (id: string) => `/admin/roles/users/${id}/edit-roles`,
    permissions: (id: string) => `/admin/roles/users/${id}/permissions`,
    suspend: (id: string) => `/admin/users/${id}/suspend`,
    delete: (id: string) => `/admin/users/${id}`,
    addEmployee: '/admin/roles/users/add-employee',
    revokeAccess: (id: string) => `/admin/roles/users/${id}/revoke-access`,
    userRoles: (id: string) => `/admin/roles/users/${id}/roles`,
  },

  // User Management endpoints (all users, not just staff)
  users: {
    list: '/admin/users/all', // Get all users with pagination and filters
    byId: (id: string) => `/admin/users/${id}`, // Get user details with orders, reviews, wishlist
    staff: '/admin/users/staff', // Get staff only (employees and owners)
    suspend: (id: string) => `/admin/users/${id}/suspend`, // Suspend/unsuspend user
    delete: (id: string) => `/admin/users/${id}`, // Delete user
    updateRole: (id: string) => `/admin/users/${id}/role`, // Update user role
  },

  // Coupon Management endpoints
  coupons: {
    list: '/admin/coupon', // Get all coupons with pagination, filtering, search
    byId: (id: string) => `/admin/coupon/${id}`, // Get coupon by ID
    create: '/admin/coupon/create', // Create new coupon
    update: (id: string) => `/admin/coupon/${id}`, // Update coupon
    delete: (id: string) => `/admin/coupon/${id}`, // Delete coupon
    validate: (code: string) => `/admin/coupon/validate/${code}`, // Validate coupon code
  },

  // Sales Management endpoints (Flash Sales, Limited Sales, Normal Sales)
  sales: {
    list: '/admin/sales/all', // Get all sales with pagination and search
    byId: (id: string) => `/admin/sales/${id}`, // Get sale by ID with full details
    search: '/admin/sales/all', // Same endpoint, uses search param
    create: '/admin/sales', // Create new sale
    update: (id: string) => `/admin/sales/${id}`, // Update sale
    delete: (id: string) => `/admin/sales/${id}`, // Delete sale
    byType: (type: 'Flash' | 'Limited' | 'Normal') =>
      `/admin/sales/type/${type}`, // Get sales by type
    usage: (id: string) => `/admin/sales/${id}/usage`, // Get sale usage statistics
    decrement: (id: string) => `/admin/sales/${id}/decrement`, // Decrement sale limit (when purchased)
    activeFlash: '/admin/sales/active/flash', // Get active flash sales
    activeLimited: '/admin/sales/active/limited', // Get active limited sales
    activeNormal: '/admin/sales/active/normal', // Get active normal sales
  },

  // Campaign Management endpoints
  campaigns: {
    list: '/admin/campaigns/list', // Get campaigns list (minimal data, no population)
    all: '/admin/campaigns/all', // Get all campaigns (full data with populations)
    byId: (id: string) => `/admin/campaigns/${id}`, // Get campaign by ID
    create: '/admin/campaigns/create', // Create new campaign
    update: (id: string) => `/admin/campaigns/${id}`, // Update campaign
    delete: (id: string) => `/admin/campaigns/${id}`, // Delete campaign
    toggleStatus: (id: string) => `/admin/campaigns/${id}/status`, // Toggle active/inactive status
  },

  // Transaction endpoints
  transactions: {
    list: '/admin/transactions',
    byId: (id: string) => `/admin/transactions/${id}`,
    statistics: '/admin/transactions/statistics',
    refund: (id: string) => `/admin/transactions/${id}/refund`,
  },
} as const;

export default api;
