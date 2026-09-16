import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import EditShipmentForm from '@/app/shared/shipment/edit-shipment-form';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Edit Shipment', undefined, 'Edit shipment details'),
};

interface EditShipmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditShipmentPage({ params }: EditShipmentPageProps) {
  const resolvedParams = await params;
  const pageHeader = {
    title: 'Edit Shipment',
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
  href: routes.eCommerce.shipment.shipmentDetails(resolvedParams.id),
        name: 'Details',
      },
      {
        name: 'Edit',
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <EditShipmentForm shipmentId={resolvedParams.id} />
    </>
  );
}
