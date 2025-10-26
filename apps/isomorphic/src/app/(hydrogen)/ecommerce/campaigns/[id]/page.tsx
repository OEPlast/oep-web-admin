import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import CampaignDetails from '@/app/shared/ecommerce/campaign/campaign-details';
import { Button } from 'rizzui';
import Link from 'next/link';

export const metadata = {
  ...metaObject('Campaign Details'),
};

interface CampaignDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailsPage({
  params,
}: CampaignDetailsPageProps) {
  const { id } = await params;

  const pageHeader = {
    title: 'Campaign Details',
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
        name: 'Details',
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.editCampaign(id)}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            Edit Campaign
          </Button>
        </Link>
      </PageHeader>
      <CampaignDetails id={id} />
    </>
  );
}
