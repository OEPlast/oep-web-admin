import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import OneOrderNav from '@/app/shared/mini-nav';

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
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <OneOrderNav menuItems={menuItemsForMiniNav} />
      {children}
    </>
  );
}
