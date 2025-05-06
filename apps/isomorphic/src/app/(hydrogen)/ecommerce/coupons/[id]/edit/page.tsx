import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import EditCoupon from '@/app/shared/ecommerce/coupon/edit-coupon';
// import CreateCoupon from '@/app/shared/ecommerce/coupons/create-coupon'; // To be implemented

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Edit ${id}`);
}

const pageHeader = {
  title: 'Edit Coupon',
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

export default async function EditCouponPage({ params }: any) {
  const id = (await params).id;
  return (
    <>
      <PageHeader
        title={pageHeader.title}
        breadcrumb={[
          ...pageHeader.breadcrumb,
          { name: id, href: '.' },
          { name: 'Edit' },
        ]}
      >
        <Link
          href={routes.eCommerce.coupons}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      <EditCoupon id={id} />
    </>
  );
}
