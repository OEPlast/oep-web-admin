'use client';

import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { PiPlusBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import Link from 'next/link';

export default function ShipmentPageHeader() {
  return (
    <PageHeader
      title="Shipments"
      breadcrumb={[
        { href: routes.eCommerce.dashboard, name: 'E-Commerce' },
        { name: 'Shipments' },
      ]}
    >
      <Link href={routes.eCommerce.shipment.createShipment} className="mt-4 w-full @lg:mt-0 @lg:w-auto">
        <Button as="span" className="w-full @lg:w-auto">
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Create Shipment
        </Button>
      </Link>
    </PageHeader>
  );
}
