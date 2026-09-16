import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
import LogisticsConfigTable from '@/app/shared/logistics/config/table';
import { PiPlusBold } from 'react-icons/pi';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Logistics Configuration', undefined, 'Manage shipping locations and pricing'),
};

const pageHeader = {
  title: 'Logistics Configuration',
  breadcrumb: [
    {
  href: routes.eCommerce.logistics.home,
      name: 'Logistics',
    },
    
    {
      name: 'All Countries',
    },
  ],
};

export default function LogisticsConfigPage() {
  return (
    <>
      <PageHeaderWithNavigation title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}
          href={routes.eCommerce.logistics.createConfig}
          buttonText="Add Country"
      
      />
       
      <LogisticsConfigTable />
    </>
  );
}
