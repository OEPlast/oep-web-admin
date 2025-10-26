import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import BannerEditClient from './BannerEditClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Edit ${id}`);
}

export default async function EditBannerPage({ params }: any) {
  const id = (await params).id;
  const pageHeader = {
    title: 'Edit Banner',
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'E-Commerce',
      },
      {
        href: routes.eCommerce.banners,
        name: 'Banners',
      },
      {
        href: routes.eCommerce.bannerDetails(id),
        name: id,
      },
      {
        name: 'Edit',
      },
    ],
  };
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.banners}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      <BannerEditClient bannerId={id} />
    </>
  );
}
