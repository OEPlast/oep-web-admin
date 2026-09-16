import type { Metadata } from 'next';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import InventoryClient from './inventory-client';

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Stock levels and low-stock alerts',
};

const pageHeader = {
  title: 'Inventory',
  breadcrumb: [
    { href: routes.eCommerce.dashboard, name: 'Home' },
    { name: 'Inventory' },
  ],
};

export default function InventoryPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <InventoryClient />
    </>
  );
}
