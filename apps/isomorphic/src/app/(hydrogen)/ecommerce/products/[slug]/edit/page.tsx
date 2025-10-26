import { Metadata } from 'next';
import ProductEditClient from '@/app/shared/ecommerce/product/ProductEditClient';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * for dynamic metadata
 * @link: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const slug = (await params).slug;

  return metaObject(`Edit Product ${slug}`);
}

const pageHeader = {
  title: 'Edit Product',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.products,
      name: 'Products',
    },
    {
      name: 'Edit',
    },
  ],
};

export default async function EditProductPage({ params }: Props) {
  const slug = (await params).slug;
  
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ProductEditClient productId={slug} />
    </>
  );
}
