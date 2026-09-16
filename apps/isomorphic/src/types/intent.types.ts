/**
 * Intent shops — curated SEO landing pages served by the storefront at
 * `/shop/<slug>`. Each one targets a specific search intent and shows a
 * hand-picked, manually ordered set of products.
 */

export type IntentStatus = 'active' | 'inactive' | 'draft';

/** Mirrors MIN_PUBLISHED_PRODUCTS on the backend — below this you cannot publish. */
export const MIN_PUBLISHED_PRODUCTS = 3;

export interface IntentProduct {
  _id: string;
  name: string;
  slug: string;
  price?: number;
  stock?: number;
  status?: string;
  description_images?: Array<{ url: string; cover_image?: boolean }>;
  images?: Array<{ url: string; cover_image?: boolean }>;
}

export interface IntentFaq {
  question: string;
  answer: string;
}

export interface Intent {
  _id: string;
  slug: string;
  heading: string;
  title: string;
  description: string;
  keywords: string[];
  intro?: string;
  /** Ordered — array order is the storefront display order. */
  products: IntentProduct[];
  faqs: IntentFaq[];
  status: IntentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntentInput {
  slug: string;
  heading: string;
  title: string;
  description: string;
  keywords?: string[];
  intro?: string;
  /** Ordered product ids. */
  products: string[];
  faqs?: IntentFaq[];
  status?: IntentStatus;
}

export type UpdateIntentInput = Partial<CreateIntentInput>;

export interface IntentFilters {
  status?: IntentStatus;
}

export const INTENT_STATUS_OPTIONS: Array<{ label: string; value: IntentStatus }> = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Draft', value: 'draft' },
];

/** Turn a heading into a URL-safe slug candidate. */
export function slugifyIntent(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Cover image for a product card, mirroring the storefront's selection rule. */
export function intentProductCover(product: IntentProduct): string | undefined {
  const imgs = product.description_images?.length ? product.description_images : product.images;
  const cover = imgs?.find((i) => i.cover_image) || imgs?.[0];
  return cover?.url;
}
