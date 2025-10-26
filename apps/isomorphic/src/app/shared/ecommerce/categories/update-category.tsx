'use client';

import { useState } from 'react';
import { useUpdateCategory } from '@/hooks/mutations/useCategoryMutations';
import { UpdateCategoryFormInput } from '@/validators/create-category.schema';
import { useModal } from '../../modal-views/use-modal';
import CategoryForm from './category-form';
import { CategoryType } from './category-types';
import { BackendValidationError, extractBackendErrors } from '@/libs/form-errors';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function UpdateCategory({
  category,
  isModalView = true,
  onDelete,
}: {
  category: CategoryType;
  isModalView?: boolean;
  onDelete?: () => void;
}) {
  const [apiErrors, setApiErrors] = useState<BackendValidationError[] | null>(null);
  const queryClient = useQueryClient();
  const updateCategory = useUpdateCategory({
    onSuccess: () => {
        toast.success('Category updated successfully');
              queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', category._id] });
        // modalController.closeModal();
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error.response.data);
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

  const handleSubmit = (data: any) => {
    setApiErrors(null); // Clear previous errors
    const updateData: UpdateCategoryFormInput = {
      name: data.name,
      description: data.description,
      image: data.image,
      banner: data.banner,
      parent: data.parent || [],
      _id: category._id,
      slug: category.slug,
      createdAt: category.createdAt,
    };

    updateCategory.mutate({ id: category._id, data: updateData });
  };

  return (
    <CategoryForm
      mode="update"
      defaultValues={category}
      onSubmit={handleSubmit}
      onDelete={onDelete}
      isLoading={updateCategory.isPending}
      submitButtonText="Update Category"
      isModalView={isModalView}
      apiErrors={apiErrors}
    />
  );
}
