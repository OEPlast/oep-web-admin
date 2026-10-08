// Storefront content managed under /admin/content (Main-server models Article, SiteContent,
// FaqGroup, LegalDocument and SizeChart). Image fields hold bare CDN paths.

export type ArticleStatus = 'draft' | 'published';

export const ARTICLE_STATUS_OPTIONS: Array<{ value: ArticleStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export type TextBlockType = 'lead' | 'heading' | 'paragraph' | 'quote';

export type ArticleBlock =
  | { type: TextBlockType; text: string }
  | { type: 'image'; src: string; alt?: string };

export type ArticleBlockType = ArticleBlock['type'];

export const BLOCK_TYPE_OPTIONS: Array<{ value: ArticleBlockType; label: string }> = [
  { value: 'lead', label: 'Lead (intro paragraph)' },
  { value: 'heading', label: 'Heading' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'quote', label: 'Quote' },
  { value: 'image', label: 'Image' },
];

/** List rows: the admin list endpoint leaves out `body`. */
export interface ArticleSummary {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  status: ArticleStatus;
  publishedAt?: string | null;
  seo?: { title?: string; description?: string };
  createdAt: string;
  updatedAt: string;
}

export interface Article extends ArticleSummary {
  body: ArticleBlock[];
}

export interface ArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  image?: string;
  status?: ArticleStatus;
  publishedAt?: string | null;
  body?: ArticleBlock[];
  seo?: { title?: string; description?: string };
}

export interface ArticleListFilters {
  page?: number;
  limit?: number;
  status?: ArticleStatus;
  search?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SiteContent {
  _id?: string;
  testimonials: Array<{ quote: string; author: string }>;
  instagram: Array<{ image: string; link?: string }>;
  popularSearches: string[];
  articleCategories: Array<{ value: string; label: string }>;
  newsletterPopup: {
    enabled: boolean;
    headline: string;
    body: string;
    /** A code created on the Coupons page, sent in the welcome email. */
    couponCode: string;
  };
}

export interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
}

export interface FaqGroup {
  _id: string;
  key: string;
  label: string;
  order: number;
  items: FaqItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqGroupInput {
  label: string;
  key?: string;
  order?: number;
  items: Array<{ question: string; answer: string }>;
}

export interface LegalSection {
  id: string;
  heading: string;
  body: string;
}

/** List rows: the admin list endpoint leaves out `sections`. */
export interface LegalDocumentSummary {
  _id: string;
  slug: string;
  title: string;
  effectiveDate: string;
  intro: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegalDocument extends LegalDocumentSummary {
  sections: LegalSection[];
}

export interface LegalDocumentInput {
  title: string;
  slug?: string;
  effectiveDate: string;
  intro?: string;
  sections: LegalSection[];
}

/** Slugs the storefront links to; offered as suggestions on the legal page form. */
export const SUGGESTED_LEGAL_SLUGS = [
  'privacy-policy',
  'terms-of-service',
  'returns-policy',
  'shipping-policy',
];

export interface SizeChart {
  _id: string;
  slug: string;
  title: string;
  /** The first column is the size label shown on the product page. */
  columns: string[];
  rows: string[][];
  howToMeasure: Array<{ label: string; text: string }>;
  fitNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface SizeChartInput {
  title: string;
  slug?: string;
  columns: string[];
  rows: string[][];
  howToMeasure: Array<{ label: string; text: string }>;
  fitNote?: string;
}

/** Same rule as Main-server's slugify(..., { lower: true, strict: true }), close enough for previews. */
export const toSlug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
