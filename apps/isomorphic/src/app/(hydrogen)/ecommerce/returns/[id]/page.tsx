import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import ReturnsView from '@/app/shared/ecommerce/returns/order-view';

export default async function ReturnsDetailsPage({ params }: any) {
  const id = (await params).id;
  const pageHeader = {
    title: `Returns #${id}`,
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'E-Commerce',
      },
      {
        href: routes.eCommerce.returns,
        name: 'Returnss',
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
          href={routes.eCommerce.editReturns(id)}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            Edit Returns
          </Button>
        </Link>
      </PageHeader>
      <ReturnsView />
    </>
  );
}
