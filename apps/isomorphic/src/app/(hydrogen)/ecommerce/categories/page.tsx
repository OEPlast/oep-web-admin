import { routes } from '@/config/routes';
import CategoriesClient from './CategoriesClient';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Categories'),
};

const pageHeader = {
  title: 'Categories',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      name: 'Categories',
    },
  ],
};

export default function CategoriesPage() {
  return (
    <>

      <CategoriesClient  title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
    </>
  );
}
