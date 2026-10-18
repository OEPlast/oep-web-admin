// Category types for admin UI, matching backend schema
export type CategoryType = {
  _id: string;
  name: string;
  image: string;
  banner: string;
  slug: string;
  description?: string;
  parent: string[];
  priority: boolean;
  /** Size chart slug used by products in this category that don't set their own. */
  sizeChart?: string;
  /** Products here are suggested as add-ons (e.g. gift boxes). */
  isAddOnCategory?: boolean;
  /** Listed in the storefront menu (top-level categories, up to 20). */
  showInMenu?: boolean;
  createdAt: Date;
  updatedAt: Date;
  subcategoryCount?: number;
};

export type CategoryWithSubs = CategoryType& {
  sub_categories: Array<{
    _id: string;
    name: string;
    image: string;
    slug: string;
    banner?: string;
    description?: string;
    priority?: boolean;
  }>;
  parent_categories: Array<{
    _id: string;
    name: string;
    image: string;
    slug: string;
  }>;
};

export type CategoryListParams = {
  page?: number;
  limit?: number;
  name?: string;
};

export type CategoryListResponse = {
  items: CategoryType[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// For dropdown/select options
export type CategoryListOption = {
  _id: string;
  name: string;
  slug?: string;
};
