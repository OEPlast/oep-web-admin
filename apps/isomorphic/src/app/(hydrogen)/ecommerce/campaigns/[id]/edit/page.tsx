import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { Button } from 'rizzui';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import EditCampaign from '@/app/shared/ecommerce/campaign/edit-campaign';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Edit Campaign ${id}`);
}

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
      name: 'Edit',
    },
  ],
};

export default async function EditCampaignPage({ params }: Props) {
  const { id } = await params;

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
}
