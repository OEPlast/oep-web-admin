import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
// import CouponView from '@/app/shared/ecommerce/coupons/coupon-view'; // To be implemented

export default async function CouponDetailsPage({ params }: any) {
  const id = (await params).id;
  const pageHeader = {
    title: `Coupon #${id}`,
    breadcrumb: [
      {
        href: routes.eCommerce.dashboard,
        name: 'E-Commerce',
      },
      {
        href: routes.eCommerce.coupons,
        name: 'Coupons',
      },
      {
        name: id,
      },
    ],
  };
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.editCoupon(id)}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto">
            Edit Coupon
          </Button>
        </Link>
      </PageHeader>
      {/* <CouponView /> */}
      <div>Coupon details view goes here</div>
    </>
  );
}
