import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import ReviewsPageClient from './reviews-client';

export const metadata = {
  ...metaObject('Reviews'),
};

const pageHeader = {
  title: 'All Reviews',
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
      name: 'All',
    },
  ],
};

export default function ReviewsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ReviewsPageClient />
    </>
  );
}
