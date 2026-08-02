import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import IntentForm from '@/app/shared/marketing/intent/intent-form';

export const metadata = {
  ...metaObject('Create an Intent Shop'),
};

const pageHeader = {
  title: 'Create An Intent Shop',
  breadcrumb: [
    {
      name: 'Marketing',
    },
    {
      href: routes.eCommerce.intents,
      name: 'Intent Shops',
    },
    {
      name: 'Create',
    },
  ],
};

export default function CreateIntentShopPage() {
  return (
    <>
      <PageHeaderWithNavigation
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        href={routes.eCommerce.intents}
        buttonText="Cancel"
      />
      <IntentForm />
    </>
  );
}
