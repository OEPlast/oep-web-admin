import PageHeader from '@/app/shared/page-header';
import ReturnDetailsClient from './return-details-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Return Details', undefined, 'View and manage return request details'),
};

const pageHeader = {
  title: 'Return Details',
  breadcrumb: [
    {
      href: '/returns',
      name: 'Returns',
    },
    {
      name: 'Details',
    },
  ],
};

export default async function ReturnDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ReturnDetailsClient returnId={id} />
    </>
  );
}
