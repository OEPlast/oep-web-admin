'use client';

import Link from 'next/link';
import { Button, Text } from 'rizzui';
import { PiChartLineUp, PiArrowRightDuotone } from 'react-icons/pi';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import { routes } from '@/config/routes';

/**
 * The Performance section of the product form.
 *
 * A door, not a dashboard. Analytics belong on their own page with their own
 * date range, and embedding a second one inside an unsaved form invites an
 * operator to read figures while editing the thing being measured.
 *
 * On create there is no product to measure yet, so the button is replaced with
 * the reason rather than linking somewhere that would prompt for a SKU that does
 * not exist.
 */
export default function ProductPerformance({
  className,
  productId,
}: {
  className?: string;
  productId?: string;
}) {
  return (
    <FormGroup
      title="Performance"
      description="Sales, reviews and demand for this product"
      className={cn(className)}
    >
      <div className="col-span-2 @4xl:col-span-2">
        <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-gray-300 p-6 @lg:flex-row @lg:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-lighter">
            <PiChartLineUp className="h-6 w-6 text-primary" />
          </span>

          <div className="flex-1">
            <Text className="font-semibold text-gray-900">
              Product performance &amp; analytics
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {productId
                ? 'Revenue, units sold, orders, ratings, wishlist and cart demand for this product over any period.'
                : 'Available once the product has been created — there is nothing to measure yet.'}
            </Text>
          </div>

          {productId ? (
            <Link href={routes.productPerformance(productId)}>
              <Button as="span" className="gap-2 whitespace-nowrap">
                Click here for performance
                <PiArrowRightDuotone className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button disabled className="gap-2 whitespace-nowrap">
              Click here for performance
              <PiArrowRightDuotone className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </FormGroup>
  );
}
