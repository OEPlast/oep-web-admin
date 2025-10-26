'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { useUpdateProduct, useDeleteProduct } from '@/hooks/mutations/useProductMutations';
import { extractBackendErrors, BackendValidationError } from '@/libs/form-errors';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreateProductInput } from '@/validators/product-schema';
import { Product } from '@/hooks/queries/useProducts';
import CreateEditProduct from '@/app/shared/ecommerce/product/create-edit';

interface UpdateProductProps {
  product: Product;
}

export default function UpdateProduct({ product }: UpdateProductProps) {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);

  const updateProduct = useUpdateProduct({
    onSuccess: () => {
      toast.success('Product updated successfully');
      router.push(routes.eCommerce.products);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error.response.data);
        if (backendErrors) {
          setApiErrors(backendErrors);
        } else {
          const backendMessage = error.response.data?.message;
          toast.error(backendMessage || 'Something went wrong, try again');
        }
      } else {
        toast.error('Something went wrong, try again');
      }
    },
  });

  const deleteProduct = useDeleteProduct({
    onSuccess: () => {
      toast.success('Product deleted successfully');
      router.push(routes.eCommerce.products);
    },
    onError: (error) => {
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to delete product';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (data: CreateProductInput) => {
    setApiErrors(null);
    updateProduct.mutate({
      id: product._id,
      data,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate(product._id);
    }
  };

  return (
    <CreateEditProduct
      mode="edit"
      product={product}
      onSubmit={handleSubmit}
      isLoading={updateProduct.isPending || deleteProduct.isPending}
    />
  );
}
