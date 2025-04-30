import PageHeader from '@/app/shared/page-header';
import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { metaObject } from '@/config/site.config';
// import CreateFlashSale from '@/app/shared/ecommerce/flash-sales/create-flash-sale'; // To be implemented

export const metadata = {
  ...metaObject('Create a Flash Sale'),
};

const pageHeader = {
  title: 'Create A Flash Sale',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.flashSales,
      name: 'Flash Sales',
    },
    {
      name: 'Create',
    },
  ],
};

export default function CreateFlashSalePage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.flashSales}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      {/* <CreateFlashSale /> */}
      <div>Flash sale creation form goes here</div>
    </>
  );
}
