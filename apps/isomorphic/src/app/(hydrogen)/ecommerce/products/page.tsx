import ProductsClient from '@/app/shared/ecommerce/product/ProductsClient';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Products'),
};

export default function ProductsPage() {
  return <ProductsClient />;
}
