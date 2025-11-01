import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import OneSaleView from '@/app/shared/ecommerce/sales/one-sale-view';
// import FlashSaleView from '@/app/shared/ecommerce/flash-sales/flash-sale-view'; // To be implemented

export default async function FlashSaleDetailsPage({ params }: any) {
  const id = (await params).id;
  const pageHeader = {
    title: `Sale #${id}`,
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
        name: id,
      },
    ],
  };
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.editFlashSale(id)}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            Edit Sale
          </Button>
        </Link>
      </PageHeader>
      <OneSaleView id={id} />
    </>
  );
}
