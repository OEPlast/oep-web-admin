'use client';

import { useCoupon } from '@/hooks/queries/useCoupons';
import { Loader, Text, Badge } from 'rizzui';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { Button } from 'rizzui/button';

export default function CouponDetails({ id }: { id: string }) {
  const { data: coupon, isLoading, error } = useCoupon(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading coupon: {error?.message || 'Coupon not found'}
      </div>
    );
  }

  const isDeleted = coupon.deleted;
  const now = new Date();
  const startDate = new Date(coupon.startDate);
  const endDate = new Date(coupon.endDate);
  const isExpired = now > endDate;
  const isUpcoming = now < startDate;

  let status = 'Active';
  let statusColor: 'success' | 'warning' | 'danger' | 'secondary' = 'success';

  if (isDeleted) {
    status = 'Deleted';
    statusColor = 'danger';
  } else if (!coupon.active) {
    status = 'Inactive';
    statusColor = 'secondary';
  } else if (isExpired) {
    status = 'Expired';
    statusColor = 'danger';
  } else if (isUpcoming) {
    status = 'Upcoming';
    statusColor = 'warning';
  }

  return (
    <div className="mx-0 mt-8 max-w-2xl rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      {isDeleted && (
        <p className="mb-6 rounded bg-red-50 px-4 py-2 text-base font-semibold text-red-700">
          This coupon is deleted
        </p>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{coupon.coupon}</h2>
        <Badge variant="flat" color={statusColor} size="lg">
          {status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="text-sm font-medium text-gray-600">Discount</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {coupon.discount}
            {coupon.discountType === 'percentage' ? '%' : '$'}
            {coupon.discountType === 'fixed' && ' off'}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600">Type</div>
          <div className="mt-1 font-semibold capitalize text-gray-900">
            {coupon.couponType.replace(/-/g, ' ')}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600">Times Used</div>
          <div className="mt-1 font-semibold text-gray-900">
            {coupon.timesUsed}
            {coupon.maxUsage ? ` / ${coupon.maxUsage}` : ' (unlimited)'}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600">Active</div>
          <div
            className={`font-semibold ${
              coupon.active ? 'mt-1 text-green-600' : 'mt-1 text-red-600'
            }`}
          >
            {coupon.active ? 'Yes' : 'No'}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600">Start Date</div>
          <div className="mt-1 font-semibold text-gray-900">
            {new Date(coupon.startDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600">End Date</div>
          <div className="mt-1 font-semibold text-gray-900">
            {new Date(coupon.endDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {coupon.minOrderValue !== undefined && coupon.minOrderValue > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-600">
              Minimum Order Value
            </div>
            <div className="mt-1 font-semibold text-gray-900">
              ${coupon.minOrderValue}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm font-medium text-gray-600">Stackable</div>
          <div className="mt-1 font-semibold text-gray-900">
            {coupon.stackable ? 'Yes' : 'No'}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-600">Applies To</div>
          <div className="mt-1 font-semibold capitalize text-gray-900">
            {coupon.appliesTo?.scope || 'order'}
          </div>
        </div>

        {coupon.maxUsagePerUser && (
          <div>
            <div className="text-sm font-medium text-gray-600">
              Max Usage Per User
            </div>
            <div className="mt-1 font-semibold text-gray-900">
              {coupon.maxUsagePerUser}
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <div className="text-sm font-medium text-gray-600">Created At</div>
          <div className="mt-1 font-semibold text-gray-900">
            {new Date(coupon.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {coupon.notes && (
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-gray-600">Notes</div>
            <div className="mt-1 font-semibold text-gray-700">
              {coupon.notes}
            </div>
          </div>
        )}

        <div className="md:col-span-2">
          <div className="text-sm font-medium text-gray-600">Show on cart</div>
          <div className="mt-1 font-semibold text-gray-700">
            {coupon.showOnCartPage ? 'True' : 'False'}
          </div>
        </div>
      </div>

      {!isDeleted && (
        <div className="mt-8 flex gap-3">
          <Link href={routes.eCommerce.editCoupon(id)} className="flex-1">
            <Button className="w-full">Edit Coupon</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
