import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import EditSales from '@/app/shared/ecommerce/sales/edit-sales';
import { salesData } from '@/data/sales-data';
import { CreateSalesInput } from '@/validators/create-sale.schema';
import { Text } from 'rizzui/typography';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Edit ${id}`);
}

const pageHeader = {
  title: 'Edit Sale',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.flashSales,
      name: 'Sales',
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
      {/* {!fetchedSale ? (
        <div className="p-6">
          <Text className="text-center text-red-500">Sale not found.</Text>
        </div>
      ) : ( */}
      <EditSales saleId="sale_to_edit_123" />
      {/* )} */}
    </>
  );
}
