import ShipmentsClient from '@/app/shared/ecommerce/shipment/ShipmentsClient';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Shipments', undefined, 'Manage all shipments'),
};

export default function ShipmentsPage() {
  return (
    <ShipmentsClient />
  );
}
