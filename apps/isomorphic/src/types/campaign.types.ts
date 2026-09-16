// Campaign API types (used by useCampaigns / useCampaignMutations).

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
