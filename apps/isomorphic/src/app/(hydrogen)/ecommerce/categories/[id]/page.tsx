import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import { Button } from 'rizzui';
import Link from 'next/link';
import CategoryDetailClient from './CategoryDetailClient';
import { PiPencilSimpleBold } from 'react-icons/pi';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Category ${id}`);
}

export default async function CategoryDetailPage({ params }: Props) {
  const id = (await params).id;

  const pageHeader = {
    title: 'Category Details',
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'E-Commerce',
      },
      {
        href: routes.eCommerce.categories,
        name: 'Categories',
      },
      {
        name: id,
      },
    ],
  };

  return (

      <CategoryDetailClient categoryId={id} title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

  );
}
