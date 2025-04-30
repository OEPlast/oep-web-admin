import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
// import CouponsTable from '@/app/shared/ecommerce/coupons/coupons-table'; // To be implemented
import { PiPlusBold } from 'react-icons/pi';
// import { couponData } from '@/data/coupon-data'; // To be implemented
import { metaObject } from '@/config/site.config';
// import ExportButton from '@/app/shared/export-button'; // Optional

export const metadata = {
  ...metaObject('Coupons'),
};

const pageHeader = {
  title: 'Coupons',
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
      name: 'All',
    },
  ],
};

export default function CouponsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {/* <ExportButton data={couponData} fileName="coupons_data" header="..." /> */}
          <Link
            href={routes.eCommerce.createCoupon}
            className="w-full @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Create Coupon
            </Button>
          </Link>
        </div>
      </PageHeader>
      {/* <CouponsTable /> */}
      <div>Coupons table goes here</div>
    </>
  );
}
