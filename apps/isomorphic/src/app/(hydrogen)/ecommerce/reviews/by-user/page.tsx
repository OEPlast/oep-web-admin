import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import ReviewsByUserClient from './reviews-by-user-client';

export const metadata = {
  ...metaObject('Reviews by User'),
};

const pageHeader = {
  title: 'Reviews by User',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.reviews,
      name: 'Reviews',
    },
    {
      name: 'By User',
    },
  ],
};

export default function ReviewsByUserPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ReviewsByUserClient />
    </>
  );
}
