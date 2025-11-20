import { Metadata } from 'next';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import EditShipmentForm from '@/app/shared/shipment/edit-shipment-form';

export const metadata: Metadata = {
  title: 'Edit Shipment | Admin Dashboard',
  description: 'Edit shipment details',
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
