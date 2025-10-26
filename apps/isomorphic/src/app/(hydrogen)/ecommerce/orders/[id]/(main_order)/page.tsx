import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import { Button, Text } from 'rizzui';

export default async function OrderDetailsPage({ params }: any) {
  const id = (await params).id;

  const pageHeader = {
    title: `Order #${id}`,
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'E-Commerce',
      },
      {
        href: routes.eCommerce.orders,
        name: 'Orders',
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
          href={routes.eCommerce.orders}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Back to Orders
          </Button>
        </Link>
      </PageHeader>
      <div className="p-6">
        <Text className="text-center text-gray-500">
          Order details are shown in the drawer on the main orders page.
          Click "Back to Orders" and then click the eye icon to view order details.
        </Text>
      </div>
    </>
  );
}
