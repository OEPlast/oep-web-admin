export type AppliesTo = {
  scope: 'order' | 'product' | 'category';
  productIds?: string[];
  categoryIds?: string[];
};

export type CouponDataType = {
  _id: string;
  coupon: string;
  startDate: Date;
  endDate: Date;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  minOrderValue?: number;
  appliesTo?: AppliesTo;
  stackable?: boolean;
  showOnCartPage?: boolean;
  active: boolean;
  timesUsed: number;
  maxUsage?: number | null;
  maxUsagePerUser?: number | null;
  couponType: 'one-off' | 'one-off-user' | 'one-off-for-one-person' | 'normal';
  allowedUser?: string | null;
  usedBy?: string[];
  notes?: string;
  creator: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type CreateCouponInput = Omit<
  CouponDataType,
  | '_id'
  | 'createdAt'
  | 'updatedAt'
  | 'timesUsed'
  | 'usedBy'
  | 'creator'
  | 'deleted'
>;

export type UpdateCouponInput = Partial<
  Omit<
    CouponDataType,
    '_id' | 'createdAt' | 'updatedAt' | 'creator' | 'timesUsed' | 'usedBy'
  >
>;
