import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import CreateReturns from '@/app/shared/ecommerce/returns/create-order';
import ImportButton from '@/app/shared/import-button';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Create Returns'),
};

const pageHeader = {
  title: 'Returns',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.orders,
      name: 'Returns',
    },
    {
      name: 'Create',
    },
  ],
};

export default function CreateOrderPage() {
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      ></PageHeader>
      <CreateReturns />
    </>
  );
}
