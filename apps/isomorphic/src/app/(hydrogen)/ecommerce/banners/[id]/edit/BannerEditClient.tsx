'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBanner } from '@/hooks/queries/useBanners';
import { useDeleteBanner } from '@/hooks/mutations/useBannerMutations';
import UpdateBanner from '@/app/shared/ecommerce/banners/update-banner';
import { Text, Loader, Modal, Button } from 'rizzui';
import { routes } from '@/config/routes';

export default function BannerEditClient({ bannerId }: { bannerId: string }) {
  const router = useRouter();
  const { data: banner, isLoading, error } = useBanner(bannerId);
  const deleteBanner = useDeleteBanner();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    deleteBanner.mutate(bannerId, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        router.push(routes.eCommerce.banners);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader variant="spinner" />
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text className="text-red-600">
          Error loading banner: {error?.message || 'Banner not found'}
        </Text>
      </div>
    );
  }

  return (
    <>
      <UpdateBanner
        banner={banner}
        isModalView={false}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="p-6">
          <Text className="text-lg font-semibold mb-4">Delete Banner</Text>
          <Text className="mb-6 text-gray-600">
            Are you sure you want to delete the banner "{banner.name}"? This action cannot be undone.
          </Text>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteBanner.isPending}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDelete}
              isLoading={deleteBanner.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
