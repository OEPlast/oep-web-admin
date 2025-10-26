import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import { metaObject } from '@/config/site.config';
import CouponDetails from '@/app/shared/ecommerce/coupon/coupon-details';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Coupon Details - ${id}`);
}

const pageHeader = {
  title: 'Coupon Details',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.coupons,
      name: 'Coupons',
    },
  ],
};

export default async function CouponDetailsPage({ params }: Props) {
  const id = (await params).id;

  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={[
          ...pageHeader.breadcrumb,
          {
            name: id,
          },
        ]}
      >
        <Link
          href={routes.eCommerce.coupons}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Back to List
          </Button>
        </Link>
      </PageHeader>
      <CouponDetails id={id} />
    </>
  );
}
