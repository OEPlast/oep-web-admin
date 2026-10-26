'use client';

import React from 'react';
import PageHeader from '@/app/shared/page-header';
import { Button, Title, ActionIcon } from 'rizzui';
import CreateBanner from '@/app/shared/ecommerce/banners/create-banner';
import { PiArrowsDownUpBold, PiPlusBold, PiXBold } from 'react-icons/pi';
import ArrangeBanners from '@/app/shared/ecommerce/banners/arrange-banners';
import { useModal } from '@/app/shared/modal-views/use-modal';

function CreateBannerModalView() {
  const { closeModal } = useModal();
  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-7 flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Create Banner
        </Title>
        <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>
      <CreateBanner isModalView={true} />
    </div>
  );
}

type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
  className?: string;
};

export default function BannerPageHeader({
  title,
  breadcrumb,
  className,
}: PageHeaderTypes) {
  const { openModal } = useModal();
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb} className={className}>
        <div className="mt-4 flex w-full flex-col gap-3 @lg:mt-0 @lg:w-auto @lg:flex-row">
        <Button
          as="span"
          variant="outline"
          className="w-full cursor-pointer @lg:w-auto"
          onClick={() => openModal({ view: <ArrangeBanners />, customSize: 720 })}
        >
          <PiArrowsDownUpBold className="me-1 h-4 w-4" />
          Arrange order
        </Button>
        <Button
          as="span"
          className="w-full cursor-pointer @lg:w-auto"
          onClick={() =>
            openModal({
              view: <CreateBannerModalView />,
              customSize: 720,
            })
          }
        >
          <PiPlusBold className="me-1 h-4 w-4" />
          Add Banner
        </Button>
        </div>
      </PageHeader>
    </>
  );
}
