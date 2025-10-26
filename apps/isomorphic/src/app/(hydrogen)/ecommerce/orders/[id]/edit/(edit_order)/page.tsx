import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import { Button, Text } from 'rizzui';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const id = (await params).id;
  return metaObject(`Edit Order #${id}`);
}

export default async function EditOrderPage({ params }: any) {
  const id = (await params).id;

  const pageHeader = {
    title: `Edit Order #${id}`,
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
        name: 'Edit',
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
            Cancel
          </Button>
        </Link>
      </PageHeader>
      <div className="p-6">
        <Text className="text-center text-gray-500">
          Order editing functionality is coming soon. Currently, you can update order status, tracking, and process refunds from the order details drawer.
        </Text>
      </div>
    </>
  );
}
