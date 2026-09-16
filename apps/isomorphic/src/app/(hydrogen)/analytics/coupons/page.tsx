import CouponsAnalyticsClient from './coupons-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Coupons Analytics', undefined, 'Comprehensive coupon usage and performance analytics'),
};

export default function CouponsAnalyticsPage() {
  return <CouponsAnalyticsClient />;
}
