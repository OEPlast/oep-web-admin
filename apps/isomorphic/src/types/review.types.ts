/**
 * Review Management Types
 * Comprehensive TypeScript interfaces for admin review system
 */

// Base Types
export interface ReviewStyle {
  color?: string;
  image?: string;
}

export interface HelpfulVotes {
  helpful: string[]; // User IDs
  notHelpful: string[]; // User IDs
}

export interface ReviewReply {
  _id: string;
  reply: string;
  replyBy: string | ReviewUser; // Can be populated
  createdAt: string;
  updatedAt: string;
}

// User reference in reviews (when populated)
export interface ReviewUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

// Product reference in reviews (when populated)
export interface ReviewProduct {
  _id: string;
  name: string;
  sku: number;
  image: string;
  slug: string;
}

// Main Review Interface
export interface Review {
  _id: string;
  product: string | ReviewProduct; // Can be populated
  reviewBy: string | ReviewUser; // Can be populated
  rating: number; // 1-5
  review: string; // Review text (10-1000 chars)
  title?: string; // Optional title (max 100 chars)
  size?: string;
  style?: ReviewStyle;
  fit?: string;
  images?: string[]; // Image URLs
  transactionId: string; // Reference to Transaction model
  orderId: string; // Reference to Order model
  helpfulVotes: HelpfulVotes;
  likes: string[]; // User IDs who liked
  replies: ReviewReply[];
  // Moderation fields
  isApproved: boolean;
  moderatedBy?: string | ReviewUser; // Admin who moderated
  moderatedAt?: string;
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination Response
export interface PaginatedReviews {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Filter Options
export interface ReviewFilters {
  page?: number;
  limit?: number;
  search?: string; // Search in review text, title
  rating?: number; // Filter by rating (1-5)
  isApproved?: boolean | 'all'; // Filter by approval status
  productId?: string; // Filter by product
  userId?: string; // Filter by user
  startDate?: string; // Filter by date range
  endDate?: string;
  sortBy?: 'createdAt' | 'rating' | 'helpfulness'; // Sort options
  sortOrder?: 'asc' | 'desc';
  hasReplies?: boolean; // Filter reviews with/without replies
  hasImages?: boolean; // Filter reviews with/without images
}

// Statistics
export interface ReviewStatistics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  withReplies: number;
  withImages: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: number; // Last 7 days
  totalHelpfulVotes: number;
}

// Mood Analytics (if backend provides sentiment analysis)
export interface MoodAnalytics {
  positive: number;
  neutral: number;
  negative: number;
  topKeywords: Array<{ word: string; count: number }>;
  averageSentimentScore: number;
}

// Moderation Actions
export type ModerationAction = 'approve' | 'reject';

export interface ModerateReviewInput {
  action: ModerationAction;
  moderationNote?: string;
}

export interface BulkModerateInput {
  reviewIds: string[];
  action: ModerationAction;
  moderationNote?: string;
}

// Reply Actions
export interface AddReplyInput {
  reply: string;
}

export interface UpdateReplyInput {
  reply: string;
}

// Form Input Types
export interface CreateReviewInput {
  product: string;
  rating: number;
  review: string;
  title?: string;
  size?: string;
  style?: ReviewStyle;
  fit?: string;
  images?: string[];
  transactionId: string;
  orderId: string;
}

export interface UpdateReviewInput {
  rating?: number;
  review?: string;
  title?: string;
  size?: string;
  style?: ReviewStyle;
  fit?: string;
  images?: string[];
  isApproved?: boolean;
  moderationNote?: string;
}

// Helper Types for Dropdowns/Selectors
export interface MinimalProduct {
  _id: string;
  name: string;
  sku: number;
  image: string;
}

export interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
  reviewCount: number;
}

// Table/List View Types (optimized for UI rendering)
export interface ReviewListItem {
  _id: string;
  productName: string;
  productImage: string;
  userName: string;
  userEmail: string;
  rating: number;
  reviewText: string; // Truncated for list view
  title?: string;
  isApproved: boolean;
  hasReplies: boolean;
  replyCount: number;
  hasImages: boolean;
  imageCount: number;
  helpfulCount: number;
  createdAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

// Filter Presets (for quick filtering in UI)
export type ReviewFilterPreset =
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'with-replies'
  | 'with-images'
  | 'high-rated'
  | 'low-rated'
  | 'recent';

export interface FilterPreset {
  id: ReviewFilterPreset;
  label: string;
  filters: Partial<ReviewFilters>;
  icon?: string; // Icon name from react-icons
}
