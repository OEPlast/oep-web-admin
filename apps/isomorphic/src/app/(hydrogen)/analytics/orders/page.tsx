import OrdersAnalyticsClient from './orders-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Orders Analytics', undefined, 'Comprehensive order analytics including trends, status distribution, and detailed order insights'),
};

export default function OrdersAnalyticsPage() {
  return <OrdersAnalyticsClient />;
}
