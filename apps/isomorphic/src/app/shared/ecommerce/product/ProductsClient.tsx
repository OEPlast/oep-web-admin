'use client';

import ProductPageHeader from './product-list/product-page-header';
import ProductsTable from './product-list/table';

export default function ProductsClient() {
  return (
    <div className="@container">
      <ProductPageHeader />
      <ProductsTable />
    </div>
  );
}
