import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import LogisticsConfigForm from '@/app/shared/logistics/config/logistics-form';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Create Logistics Configuration', undefined, 'Add a new country with shipping pricing'),
};

const pageHeader = {
  title: 'Create Logistics Configuration',
  breadcrumb: [
    {
  href: routes.eCommerce.logistics.home,
      name: 'Logistics',
    },
    {
      name: 'Create',
    },
  ],
};

export default function CreateLogisticsConfigPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <LogisticsConfigForm />
    </>
  );
}
