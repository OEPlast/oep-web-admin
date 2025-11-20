import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import DeliveryEditClient from '@/app/shared/ecommerce/delivery/DeliveryEditClient';

export const metadata = {
  ...metaObject('Edit Delivery'),
};

export default async function EditDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pageHeader = {
    title: 'Edit Delivery',
    breadcrumb: [
      { href: routes.eCommerce.dashboard, name: 'E-Commerce' },
      { href: routes.eCommerce.delivery.list, name: 'Delivery' },
      { href: routes.eCommerce.delivery.details(id), name: id },
      { name: 'Edit' },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <DeliveryEditClient id={id} />
    </>
  );
}
