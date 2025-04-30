import PageHeader from '@/app/shared/page-header';
import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { metaObject } from '@/config/site.config';
// import CreateBanner from '@/app/shared/ecommerce/banners/create-banner'; // To be implemented

export const metadata = {
  ...metaObject('Create a Banner'),
};

const pageHeader = {
  title: 'Create A Banner',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.banners,
      name: 'Banners',
    },
    {
      name: 'Create',
    },
  ],
};

export default function CreateBannerPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.banners}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      {/* <CreateBanner /> */}
      <div>Banner creation form goes here</div>
    </>
  );
}
