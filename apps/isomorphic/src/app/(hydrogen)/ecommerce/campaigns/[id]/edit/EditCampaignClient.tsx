'use client';
import React from 'react';
import { Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import EditCampaign from '@/app/shared/ecommerce/campaign/edit-campaign';
import { routes } from '@/config/routes';
import Link from 'next/link';

const EditCampaignClient = ({ id }: { id: string }) => {
  const pageHeader = {
    title: 'Edit Campaign',
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'E-Commerce',
      },
      {
        href: routes.eCommerce.campaign,
        name: 'Campaigns',
      },
      {
        href: routes.eCommerce.CampaignDetails(id),
        name: id,
      },
      {
        name: 'Edit',
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.campaign}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      <EditCampaign id={id} />
    </>
  );
};

export default EditCampaignClient;
