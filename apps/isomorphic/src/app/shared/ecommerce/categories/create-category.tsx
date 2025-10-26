'use client';

import { useState } from 'react';
import { useCreateCategory } from '@/hooks/mutations/useCategoryMutations';
import { CreateCategoryFormInput } from '@/validators/create-category.schema';
import { useModal } from '../../modal-views/use-modal';
import CategoryForm from './category-form';
import { BackendValidationError, extractBackendErrors } from '@/libs/form-errors';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreateCategory({ isModalView = true }: { isModalView?: boolean }) {
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);
  const router = useRouter();
  const createCategory = useCreateCategory({
    onSuccess: () => {
      modalController.closeModal();
      router.push('/ecommerce/categories');
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error.response.data);
        console.log(backendErrors);
        
        if (backendErrors) {
          setApiErrors(backendErrors);
        } else {
          // No field-specific errors, show toast with backend message or generic error
          const backendMessage = error.response.data?.message;
          toast.error(backendMessage || 'Something went wrong, try again');
        }
      } else {
        // Network error or other non-API error
        toast.error('Something went wrong, try again');
      }
    },
  });
  const modalController = useModal();

  const handleSubmit = (data: CreateCategoryFormInput) => {
    console.log(data);
    setApiErrors(null); // Clear previous errors
    createCategory.mutate(data);
  };

  return (
    <CategoryForm
      mode="create"
      onSubmit={handleSubmit}
      isLoading={createCategory.isPending}
      submitButtonText="Create Category"
      isModalView={isModalView}
      apiErrors={apiErrors}
    />
  );
}
