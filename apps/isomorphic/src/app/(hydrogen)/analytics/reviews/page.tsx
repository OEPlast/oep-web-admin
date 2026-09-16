import ReviewsAnalyticsClient from './reviews-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Reviews Analytics', undefined, 'Comprehensive reviews and ratings analytics'),
};

export default function ReviewsAnalyticsPage() {
  return <ReviewsAnalyticsClient />;
}
