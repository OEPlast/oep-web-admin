import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import IntentsList from './intents-list';

export const metadata = {
  ...metaObject('Intent Shops'),
};

const pageHeader = {
  title: 'Intent Shops',
  breadcrumb: [
    {
      name: 'Marketing',
    },
    {
      href: routes.eCommerce.intents,
      name: 'Intent Shops',
    },
    {
      name: 'All',
    },
  ],
};

export default function IntentShopsPage() {
  return (
    <>
      <PageHeaderWithNavigation
        href={routes.eCommerce.createIntent}
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      />
      <IntentsList />
    </>
  );
}
