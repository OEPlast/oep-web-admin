'use client';

import { useUpdateBanner } from '@/hooks/mutations/useBannerMutations';
import { UpdateBannerFormInput } from '@/validators/create-banner.schema';
import { useModal } from '../../modal-views/use-modal';
import BannerForm from './banner-form';
import { BannerType } from './banner-types';

export default function UpdateBanner({
  banner,
  isModalView = true,
  onDelete,
}: {
  banner: BannerType;
  isModalView?: boolean;
  onDelete?: () => void;
}) {
  const updateBanner = useUpdateBanner();
  const modalController = useModal();

  const handleSubmit = (data: any) => {
    // Ensure data has all required fields for UpdateBannerFormInput
    const updateData: UpdateBannerFormInput = {
      name: data.name,
      imageUrl: data.imageUrl,
      pageLink: data.pageLink,
      active: data.active ?? banner.active, // Fallback to original if not provided
      category: data.category,
      _id: banner._id,
      createdAt: banner.createdAt.toString(),
    };
    
    updateBanner.mutate(
      { id: banner._id, data: updateData },
      {
        onSuccess: () => {
          modalController.closeModal();
        },
      }
    );
  };

  return (
    <BannerForm
      mode="update"
      defaultValues={banner}
      onSubmit={handleSubmit}
      onDelete={onDelete}
      isLoading={updateBanner.isPending}
      submitButtonText="Update Banner"
      isModalView={isModalView}
    />
  );
}
