import { metaObject } from '@/config/site.config';
import OrdersPage from '@/app/shared/ecommerce/order/OrdersPage';

export const metadata = {
  ...metaObject('Orders'),
};

export default function OrdersRoute() {
  return <OrdersPage />;
}
