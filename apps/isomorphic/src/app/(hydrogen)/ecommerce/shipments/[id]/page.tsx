import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ShipmentDetails from '@/app/shared/shipment/shipment-details';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Shipment Details', undefined, 'View shipment details'),
};

interface ShipmentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ShipmentDetailsPage({
  params,
}: ShipmentDetailsPageProps) {
  const resolvedParams = await params;
  const pageHeader = {
    title: 'Shipment Details',
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
        name: resolvedParams.id,
      },
    ],
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ShipmentDetails shipmentId={resolvedParams.id} />
    </>
  );
}
