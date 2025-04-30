import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
import ReturnsTable from '@/app/shared/ecommerce/returns/order-list/table';
import { PiPlusBold } from 'react-icons/pi';
import { orderData } from '@/data/order-data';
import { metaObject } from '@/config/site.config';
import ExportButton from '@/app/shared/export-button';

export const metadata = {
  ...metaObject('Returns'),
};

const pageHeader = {
  title: 'Returns',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.returns,
      name: 'Returns',
    },
    {
      name: 'All',
    },
  ],
};

export default function ReturnsPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <ExportButton
            data={orderData}
            fileName="returns_data"
            header="Return ID,Order ID,Name,Email,Items,Price,Status,Created At,Updated At"
          />
          <Link
            href={routes.eCommerce.createReturns}
            className="w-full @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Create Returns
            </Button>
          </Link>
        </div>
      </PageHeader>

      <ReturnsTable />
    </>
  );
}
