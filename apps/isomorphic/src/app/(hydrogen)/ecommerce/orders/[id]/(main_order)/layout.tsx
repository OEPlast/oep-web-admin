import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import OneOrderNav from '@/app/shared/account-settings/navigation';

export default async function OrderDetailsPage({
  params,
  children,
}: {
  params: Promise<any>;
  children: React.ReactNode;
}) {
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

  const menuItemsForMiniNav = [
    {
      label: 'Main Details',
      value: routes.eCommerce.orderDetails(id),
    },
    {
      label: 'Delivery',
      value: routes.eCommerce.orderDetails(id) + '/delivery',
    },
  ];

  return (
    <>
      {/* <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.editOrder(id)}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            Edit Order
          </Button>
        </Link>
      </PageHeader> */}
      <OneOrderNav menuItems={menuItemsForMiniNav} />
      {children}
    </>
  );
}
