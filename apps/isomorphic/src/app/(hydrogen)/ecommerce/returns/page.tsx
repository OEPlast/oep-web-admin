import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ReturnsClient from './returns-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Returns & Refunds', undefined, 'Manage customer returns and process refunds'),
};

const pageHeader = {
  title: 'Returns & Refunds',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Home',
    },
    {
      name: 'Returns',
    },
  ],
};

export default function ReturnsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ReturnsClient />
    </>
  );
}
