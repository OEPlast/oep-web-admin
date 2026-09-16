import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import CreateShipmentForm from '@/app/shared/shipment/create-shipment-form';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Create Shipment', undefined, 'Create a new shipment'),
};

const pageHeader = {
  title: 'Create Shipment',
  breadcrumb: [
    {
  href: routes.eCommerce.logistics.home,
      name: 'Logistics',
    },
    {
  href: routes.eCommerce.shipment.shipmentList,
      name: 'Shipments',
    },
    {
      name: 'Create',
    },
  ],
};

export default function CreateShipmentPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <CreateShipmentForm />
    </>
  );
}
