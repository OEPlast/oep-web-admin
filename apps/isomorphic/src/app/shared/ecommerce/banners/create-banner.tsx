'use client';

import { useCreateBanner } from '@/hooks/mutations/useBannerMutations';
import { CreateBannerFormInput } from '@/validators/create-banner.schema';
import { useModal } from '../../modal-views/use-modal';
import BannerForm from './banner-form';

export default function CreateBanner({
  isModalView = true,
}: {
  isModalView?: boolean;
}) {
  const createBanner = useCreateBanner();
  const modalController = useModal();

  const handleSubmit = (data: CreateBannerFormInput) => {
    createBanner.mutate(data, {
      onSuccess: () => {
        modalController.closeModal();
      },
    });
  };

  return (
    <BannerForm
      mode="create"
      onSubmit={handleSubmit}
      isLoading={createBanner.isPending}
      submitButtonText="Create Banner"
      isModalView={isModalView}
    />
  );
}
