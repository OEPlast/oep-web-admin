// Legacy mock data interfaces
export interface CampaignChildProduct {
  _id: string;
  name: string;
  image: string;
  price: number;
  discount?: number;
}

export interface CampaignChildSale {
  _id: string;
  title: string;
  type: 'Flash' | 'Limited' | 'Normal';
  discount: number;
  product: CampaignChildProduct;
  startDate: string;
  endDate: string;
}

export interface CampaignDataType {
  _id: string;
  title: string;
  description: string;
  image: string;
  isActive: boolean;
  deleted: boolean;
  children: {
    products: CampaignChildProduct[];
    sales: CampaignChildSale[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// ========== NEW API INTERFACES ==========

/**
 * Product interface from API
 */
export interface Product {
  _id: string;
  name: string;
  price?: number;
  description?: string;
  slug: string;
  status: string;
  coverImage?: string;
  image?: string;
}

/**
 * Sale interface from API
 */
export interface Sale {
  _id: string;
  title: string;
  type: 'Flash' | 'Limited' | 'Normal';
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

/**
 * Campaign list item (minimal data for list view)
 * Used by /admin/campaign/list endpoint
 */
export interface CampaignListItem {
  _id: string;
  slug: string;
  image: string;
  title: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  productsCount: number;
  salesCount: number;
}

/**
 * Full campaign interface (with populated products/sales)
 * Used by /admin/campaign/all and /admin/campaign/:id endpoints
 */
export interface Campaign {
  _id: string;
  slug: string;
  image: string;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'draft';
  products: Product[] | string[];
  sales: Sale[] | string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Campaign filters
 */
export interface CampaignFilters {
  status?: 'active' | 'inactive' | 'draft';
}

/**
 * Create campaign input
 */
export interface CreateCampaignInput {
  slug: string;
  image: string;
  title: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  startDate?: Date;
  endDate?: Date;
  products?: string[];
  sales?: string[];
}

/**
 * Update campaign input
 */
export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {}

// ========== MOCK DATA (for development) ==========

export const campaignsData: CampaignDataType[] = [
  {
    _id: '6650011221a3cfb8eaf01aa1',
    title: 'Valentine Deals',
    description:
      'Romantic deals for couples and lovers. Special discounts on gifts, jewelry, and romantic products.',
    image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400',
    isActive: true,
    deleted: false,
    children: {
      products: [
        {
          _id: '1',
          name: 'Wireless Headphones',
          image:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
          price: 199.99,
        },
        {
          _id: '2',
          name: 'Smart Watch',
          image:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
          price: 299.99,
        },
        {
          _id: '664fdf8a24fbb2a2c03eabe0',
          name: 'Romantic Jewelry Set',
          image:
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200',
          price: 299.99,
          discount: 15,
        },
        {
          _id: '664fdf8a24fbb2a2c03eabe1',
          name: 'Couple Watch Set',
          image:
            'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200',
          price: 199.99,
          discount: 20,
        },
        {
          _id: '0o02051402',
          name: 'Tasty Metal Shirt',
          image:
            'https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/7.webp',
          price: 410.0,
        },
        {
          _id: '0o17477864',
          name: 'Modern Gloves',
          image:
            'https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/3.webp',
          price: 340.0,
        },
      ],
      sales: [
        {
          _id: '1',
          title: 'Flash Sale 50% Off',
          type: 'Flash' as const,
          discount: 50,
          product: {
            _id: '1',
            name: 'Wireless Headphones',
            image:
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
            price: 199.99,
          },
          startDate: '2025-02-01T00:00:00.000Z',
          endDate: '2025-02-07T23:59:59.000Z',
        },
        {
          _id: '6650011221a3cfb8eaf01bb1',
          title: 'Valentine Flash Sale',
          type: 'Flash',
          discount: 25,
          product: {
            _id: '664fdf8a24fbb2a2c03eabe2',
            name: 'Love Letters Perfume',
            image:
              'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200',
            price: 89.99,
          },
          startDate: '2025-02-10T00:00:00.000Z',
          endDate: '2025-02-14T23:59:59.000Z',
        },
        {
          _id: '6650012231a3cfb8eaf01aa2',
          title: 'Limited Deal: Modern Fashion',
          type: 'Limited',
          discount: 20,
          product: {
            _id: '0o17477864',
            name: 'Modern Gloves',
            image:
              'https://isomorphic-furyroad.s3.amazonaws.com/public/products/modern/3.webp',
            price: 340.0,
          },
          startDate: '2025-02-12T00:00:00.000Z',
          endDate: '2025-02-16T23:59:59.000Z',
        },
      ],
    },
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z',
    createdBy: '6650000011a1aa0000000001',
    updatedBy: '6650000011a1aa0000000001',
  },
  {
    _id: '6650011221a3cfb8eaf01aa2',
    title: 'Top Sales',
    description:
      'Best selling products with exclusive discounts. Limited time offers on our most popular items.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    isActive: true,
    deleted: false,
    children: {
      products: [
        {
          _id: '664fdf8a24fbb2a2c03eabe3',
          name: 'Wireless Headphones Pro',
          image:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
          price: 199.99,
          discount: 30,
        },
        {
          _id: '664fdf8a24fbb2a2c03eabe4',
          name: 'Smart Watch Series X',
          image:
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200',
          price: 399.99,
          discount: 25,
        },
      ],
      sales: [
        {
          _id: '6650011221a3cfb8eaf01bb2',
          title: 'Tech Flash Sale',
          type: 'Limited',
          discount: 35,
          product: {
            _id: '664fdf8a24fbb2a2c03eabe5',
            name: 'Gaming Laptop Pro',
            image:
              'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
            price: 1299.99,
          },
          startDate: '2025-06-01T00:00:00.000Z',
          endDate: '2025-06-15T23:59:59.000Z',
        },
      ],
    },
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-05-20T10:00:00.000Z',
    createdBy: '6650000011a1aa0000000001',
    updatedBy: '6650000011a1aa0000000001',
  },
  {
    _id: '6650011221a3cfb8eaf01aa3',
    title: 'Baby Deals',
    description:
      'Everything for your little ones. Baby clothes, toys, accessories and care products at great prices.',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400',
    isActive: false,
    deleted: false,
    children: {
      products: [
        {
          _id: '664fdf8a24fbb2a2c03eabe6',
          name: 'Baby Care Set',
          image:
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200',
          price: 49.99,
          discount: 20,
        },
        {
          _id: '664fdf8a24fbb2a2c03eabe7',
          name: 'Organic Baby Clothes',
          image:
            'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200',
          price: 29.99,
          discount: 15,
        },
      ],
      sales: [],
    },
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-20T10:00:00.000Z',
    createdBy: '6650000011a1aa0000000002',
    updatedBy: '6650000011a1aa0000000002',
  },
  {
    _id: '6650011221a3cfb8eaf01aa4',
    title: 'Quick Sales',
    description:
      "Fast deals that won't last long. Grab these limited-time offers before they're gone!",
    image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400',
    isActive: true,
    deleted: false,
    children: {
      products: [],
      sales: [
        {
          _id: '6650011221a3cfb8eaf01bb3',
          title: 'Quick Deal - Smartphone',
          type: 'Flash',
          discount: 40,
          product: {
            _id: '664fdf8a24fbb2a2c03eabe8',
            name: 'Latest Smartphone',
            image:
              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200',
            price: 799.99,
          },
          startDate: '2025-06-05T12:00:00.000Z',
          endDate: '2025-06-05T18:00:00.000Z',
        },
        {
          _id: '6650011221a3cfb8eaf01bb4',
          title: 'Quick Deal - Fashion',
          type: 'Flash',
          discount: 50,
          product: {
            _id: '664fdf8a24fbb2a2c03eabe9',
            name: 'Designer Dress',
            image:
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200',
            price: 149.99,
          },
          startDate: '2025-06-06T10:00:00.000Z',
          endDate: '2025-06-06T14:00:00.000Z',
        },
      ],
    },
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-06-01T10:00:00.000Z',
    createdBy: '6650000011a1aa0000000001',
    updatedBy: '6650000011a1aa0000000001',
  },
];
