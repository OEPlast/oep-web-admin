'use client';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { Button } from 'rizzui';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';

import CategoriesTable from '@/app/shared/ecommerce/categories/category-list/table';
export default function CategoriesClient({title, breadcrumb}: {title: string; breadcrumb: {href?: string; name: string}[]}) {

  return(
  
  <>
        <PageHeader title={title} breadcrumb={breadcrumb}>
        <Link
          href={routes.eCommerce.createCategory}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Add Category
          </Button>
        </Link>
      </PageHeader>
      <br />
  <CategoriesTable />
  </>
  );
}
