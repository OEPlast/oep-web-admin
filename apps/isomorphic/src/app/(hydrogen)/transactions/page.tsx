import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import TransactionsClient from './transactions-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Transactions', undefined, 'Manage and monitor all transactions'),
};

const pageHeader = {
  title: 'Transactions',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'Home',
    },
    {
      name: 'Transactions',
    },
  ],
};

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <TransactionsClient />
    </>
  );
}
