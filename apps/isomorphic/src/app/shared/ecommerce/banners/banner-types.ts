// Banner types for admin UI, matching backend schema
export type BannerType = {
  _id: string;
  name: string;
  imageUrl: string;
  pageLink: string;
  active: boolean;
  category: 'A' | 'B' | 'C' | 'D' | 'E';
  createdAt: Date;
  supportingText?: string | null;
  ctaColor?: string;
};
