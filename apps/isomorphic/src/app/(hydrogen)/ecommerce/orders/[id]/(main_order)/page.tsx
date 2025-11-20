import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import { Button, Text } from 'rizzui';
import OrderDetailsClient from '@/app/shared/ecommerce/order/OrderDetailsClient';

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
      <OrderDetailsClient id={id} />
    </>
  );
}
