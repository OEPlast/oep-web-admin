import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import EditIntentClient from './edit-intent-client';
import PageHeader from '@/app/shared/page-header';

export const metadata = {
  ...metaObject('Edit Intent Shop'),
};

const pageHeader = {
  title: 'Edit Intent Shop',
  breadcrumb: [
    {
      name: 'Marketing',
    },
    {
      href: routes.eCommerce.intents,
      name: 'Intent Shops',
    },
    {
      name: 'Edit',
    },
  ],
};

export default async function EditIntentShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <EditIntentClient id={id} />
    </>
  );
}
