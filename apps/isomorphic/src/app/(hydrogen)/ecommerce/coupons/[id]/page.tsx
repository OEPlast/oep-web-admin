import { Button } from 'rizzui/button';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import Link from 'next/link';
import { Text } from 'rizzui';

// Simulate fetch coupon by id (replace with real API call)
async function fetchCouponById(id: string) {
  // TODO: Replace with real API call
  // For now, return mock data
  return {
    coupon: 'SUMMER25',
    startDate: new Date('2025-05-01'),
    endDate: new Date('2025-06-01'),
    discount: 25,
    active: true,
    timesUsed: 3,
    couponType: 'normal',
    creator: '6623f1b2e1a2c3d4e5f6a7b8',
    deleted: true,
    createdAt: new Date('2025-04-01'),
    _id: id,
  };
}

export default async function CouponDetailsPage({ params }: any) {
  const id = (await params).id;
  const coupon = await fetchCouponById(id);
  const isDeleted = coupon.deleted;
  const pageHeader = {
    title: `Coupon ${id}`,
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
        {isDeleted ? (
          <Button
            as="span"
            className="w-full @lg:w-auto"
            variant="outline"
            disabled
          >
            Edit Coupon
          </Button>
        ) : (
          <Link
            href={routes.eCommerce.editCoupon(id)}
            className="mt-4 w-full @lg:mt-0 @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              Edit Coupon
            </Button>
          </Link>
        )}
      </PageHeader>
      <div className="mx-0 mt-8 max-w-xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        {isDeleted && (
          <p className="mb-6 rounded bg-red-50 px-4 py-2 text-base font-semibold text-red-700">
            This coupon is deleted
          </p>
        )}
        <div className="flex flex-col gap-6">
          <div>
            <div className="font-medium text-gray-600">Code</div>
            <div className="text-gray-900">{coupon.coupon}</div>
          </div>
          <div>
            <div className="font-medium text-gray-600">Discount</div>
            <div className="text-gray-900">{coupon.discount}%</div>
          </div>
          <div>
            <div className="font-medium text-gray-600">Type</div>
            <div className="capitalize text-gray-900">{coupon.couponType}</div>
          </div>
          <div>
            <div className="font-medium text-gray-600">Active</div>
            <div
              className={
                coupon.active && !coupon.deleted
                  ? 'text-green-600'
                  : 'text-gray-900'
              }
            >
              {coupon.active && !coupon.deleted ? 'Yes' : 'No'}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-600">Times Used</div>
            <div className="text-gray-900">{coupon.timesUsed}</div>
          </div>
          <div>
            <div className="font-medium text-gray-600">Start Date</div>
            <div className="text-gray-900">
              {coupon.startDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-600">End Date</div>
            <div className="text-gray-900">
              {coupon.endDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-600">Created At</div>
            <div className="text-gray-900">
              {coupon.createdAt.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-600">Creator</div>
            <div className="break-all text-gray-900">{coupon.creator}</div>
          </div>
        </div>
      </div>
    </>
  );
}
