'use client';

import { useProductById } from '@/hooks/queries/useProducts';
import UpdateProduct from './update-product';
import { Alert, Loader } from 'rizzui';
import { handleApiError } from '@/libs/axios';

interface ProductEditClientProps {
  productId: string;
}

export default function ProductEditClient({ productId }: ProductEditClientProps) {
  const { data: product, isLoading, error, isError } = useProductById(productId);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert color="danger" className="mb-4">
        <strong>Failed to load product:</strong> {handleApiError(error)}
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert color="warning" className="mb-4">
        <strong>Product not found</strong>
      </Alert>
    );
  }

  return <UpdateProduct product={product} />;
}
