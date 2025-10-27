import { Metadata } from 'next';
import ShipmentsClient from '@/app/shared/ecommerce/shipment/ShipmentsClient';

export const metadata: Metadata = {
  title: 'Shipments | Admin Dashboard',
  description: 'Manage all shipments',
};

export default function ShipmentsPage() {
  return (
    <ShipmentsClient />
  );
}
