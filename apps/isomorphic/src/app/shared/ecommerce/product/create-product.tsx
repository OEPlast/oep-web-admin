'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import { useCreateProduct } from '@/hooks/mutations/useProductMutations';
import { extractBackendErrors, BackendValidationError } from '@/libs/form-errors';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreateProductInput } from '@/validators/product-schema';
import CreateEditProduct from '@/app/shared/ecommerce/product/create-edit';

export default function CreateProduct() {
  const router = useRouter();
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);

  const createProduct = useCreateProduct({
    onSuccess: () => {
      toast.success('Product created successfully');
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

  const handleSubmit = (data: CreateProductInput) => {
    setApiErrors(null);
    createProduct.mutate(data);
  };

  return (
    <CreateEditProduct
      mode="create"
      onSubmit={handleSubmit}
      isLoading={createProduct.isPending}
    />
  );
}
