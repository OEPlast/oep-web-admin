import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
// import CreateFlashSale from '@/app/shared/ecommerce/flash-sales/create-flash-sale'; // To be implemented

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Edit ${id}`);
}

const pageHeader = {
  title: 'Edit Flash Sale',
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
      name: 'Edit',
    },
  ],
};

export default async function EditFlashSalePage({ params }: any) {
  const id = (await params).id;
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
      {/* <CreateFlashSale id={id} /> */}
      <div>Flash sale edit form goes here</div>
    </>
  );
}
