'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategory } from '@/hooks/queries/useCategories';
import { useDeleteCategory } from '@/hooks/mutations/useCategoryMutations';
import UpdateCategory from '@/app/shared/ecommerce/categories/update-category';
import { Text, Modal, Button, Loader } from 'rizzui';
import { routes } from '@/config/routes';

export default function CategoryEditClient({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const { data: category, isLoading, error } = useCategory(categoryId);
  const deleteCategory = useDeleteCategory();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    deleteCategory.mutate(categoryId, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        router.push(routes.eCommerce.categories);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text className="text-red-600">
          Error loading category: {error?.message || 'Category not found'}
        </Text>
      </div>
    );
  }

  return (
    <>
      <UpdateCategory
        category={category}
        isModalView={false}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="p-6">
          <Text className="text-lg font-semibold mb-4">Delete Category</Text>
          <Text className="mb-6 text-gray-600">
            Are you sure you want to delete the category "{category.name}"? This will also remove
            it from parent references in other categories.
          </Text>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteCategory.isPending}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDelete}
              isLoading={deleteCategory.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
