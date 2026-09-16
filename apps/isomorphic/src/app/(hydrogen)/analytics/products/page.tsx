import ProductsAnalyticsClient from './products-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Products Analytics', undefined, 'Comprehensive products performance analytics'),
};

export default function ProductsAnalyticsPage() {
  return <ProductsAnalyticsClient />;
}
