export const routes = {
  eCommerce: {
    dashboard: '/',
    products: '/ecommerce/products',
    createProduct: '/ecommerce/products/create',
    // Redirects to the edit page; kept for links that still target it.
    productDetails: (slug: string) => `/ecommerce/products/${slug}`,
    /** The edit page looks products up by id, not slug. */
    ediProduct: (id: string) => `/ecommerce/products/${id}/edit`,
    categories: '/ecommerce/categories',
    createCategory: '/ecommerce/categories/create',
    categoryDetails: (id: string) => `/ecommerce/categories/${id}`,
    editCategory: (id: string) => `/ecommerce/categories/${id}/edit`,
    orders: '/ecommerce/orders',
    orderDetails: (id: string) => `/ecommerce/orders/${id}`,
    returns: '/ecommerce/returns',
    returnDetails: (id: string) => `/ecommerce/returns/${id}`,
    coupons: '/ecommerce/coupons',
    createCoupon: '/ecommerce/coupons/create',
    couponDetails: (id: string) => `/ecommerce/coupons/${id}`,
    editCoupon: (id: string) => `/ecommerce/coupons/${id}/edit`,
    banners: '/ecommerce/banners',
    bannerDetails: (id: string) => `/ecommerce/banners/${id}`,
    editBanner: (id: string) => `/ecommerce/banners/${id}/edit`,
    flashSales: '/ecommerce/sales',
    createFlashSale: '/ecommerce/sales/create',
    flashSaleDetails: (id: string) => `/ecommerce/sales/${id}`,
    editFlashSale: (id: string) => `/ecommerce/sales/${id}/edit`,
    campaign: '/ecommerce/campaigns',
    createCampaign: '/ecommerce/campaigns/create',
    CampaignDetails: (id: string) => `/ecommerce/campaigns/${id}`,
    editCampaign: (id: string) => `/ecommerce/campaigns/${id}/edit`,
    // Intent shops — storefront /shop/<slug> programmatic SEO landing pages
    intents: '/marketing/intent-shops',
    createIntent: '/marketing/intent-shops/create',
    editIntent: (id: string) => `/marketing/intent-shops/${id}/edit`,
    reviews: '/ecommerce/reviews',
    reviewsByProduct: '/ecommerce/reviews/by-product',
    reviewsByUser: '/ecommerce/reviews/by-user',
    // Moved under eCommerce: Shipment and Logistics
    shipment: {
      dashboard: '/ecommerce/shipments',
      shipmentList: '/ecommerce/shipments',
      createShipment: '/ecommerce/shipments/create',
      editShipment: (id: string) => `/ecommerce/shipments/${id}/edit`,
      shipmentDetails: (id: string) => `/ecommerce/shipments/${id}`,
    },
    logistics: {
      home: '/ecommerce/logistics',
      createConfig: '/ecommerce/logistics/create',
      configDetails: (id: string) => `/ecommerce/logistics/${id}`,
      editConfig: (id: string) => `/ecommerce/logistics/${id}/edit`,
    },
    gigLogistics: {
      config: '/ecommerce/gig-logistics/config',
      deliveryTracking: '/ecommerce/gig-logistics/delivery-tracking',
      deliveryInfo: (waybill: string) => `/ecommerce/gig-logistics/delivery-info/${waybill}`,
    },
    delivery: {
      list: '/ecommerce/delivery',
      details: (id: string) => `/ecommerce/delivery/${id}`,
      edit: (id: string) => `/ecommerce/delivery/${id}/edit`,
    },
  },
  /**
   * One product's analytics. Without an id the page prompts for a SKU, so the
   * bare route is a valid destination rather than a broken link.
   */
  productPerformance: (productId?: string) =>
    productId
      ? `/analytics/products/performance?product=${productId}`
      : '/analytics/products/performance',
  rolesPermissions: '/roles-permissions',
  storeSettings: '/store-settings',
  inventory: '/inventory',
  transactions: {
    list: '/transactions',
    details: (id: string) => `/transactions/${id}`,
  },
  users: {
    list: '/users',
    details: (id: string) => `/users/${id}`,
  },
  invoice: '/invoice',
  signIn: '/signin',
  storefront: {
    signUpPage: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/register`,
    forgotPasswordPage: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/forgot-password`,
  },
};
