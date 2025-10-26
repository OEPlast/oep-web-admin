import PageHeader from '@/app/shared/page-header';
import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { metaObject } from '@/config/site.config';
import CreateCampaign from '@/app/shared/ecommerce/campaign/create-campaign';

export const metadata = {
  ...metaObject('Create a Campaign'),
};

const pageHeader = {
  title: 'Create A Campaign',
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
      name: 'Create',
    },
  ],
};

export default function CreateCampaignPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {' '}
        <Link
          href={routes.eCommerce.campaign}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      <CreateCampaign />
    </>
  );
}
