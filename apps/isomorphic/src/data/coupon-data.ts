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

export const couponData: CouponDataType[] = [
  {
    coupon: 'SAVE10',
    startDate: new Date('2025-05-01T00:00:00.000Z'),
    endDate: new Date('2025-05-31T00:00:00.000Z'),
    discount: 10,
    active: true,
    timesUsed: 5,
    couponType: 'normal',
    creator: 'userObjectId1',
    deleted: true,
    createdAt: new Date('2025-05-01T00:00:00.000Z'),
    _id: 'couponObjectId1',
  },
  {
    coupon: 'WELCOME20',
    startDate: new Date('2025-05-01T00:00:00.000Z'),
    endDate: new Date('2025-06-01T00:00:00.000Z'),
    discount: 20,
    active: true,
    timesUsed: 0,
    couponType: 'one-off',
    creator: 'userObjectId2',
    deleted: false,
    createdAt: new Date('2025-05-01T00:00:00.000Z'),
    _id: 'couponObjectId2',
  },
];
