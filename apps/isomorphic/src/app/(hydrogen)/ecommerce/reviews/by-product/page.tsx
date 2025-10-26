import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import ReviewsByProductClient from './reviews-by-product-client';

export const metadata = {
  ...metaObject('Reviews by Product'),
};

const pageHeader = {
  title: 'Reviews by Product',
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
      name: 'By Product',
    },
  ],
};

export default function ReviewsByProductPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ReviewsByProductClient />
    </>
  );
}
