import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
// import FlashSalesTable from '@/app/shared/ecommerce/flash-sales/flash-sales-table'; // To be implemented
import { PiPlusBold } from 'react-icons/pi';
// import { flashSalesData } from '@/data/flash-sales-data'; // To be implemented
import { metaObject } from '@/config/site.config';
// import ExportButton from '@/app/shared/export-button'; // Optional

export const metadata = {
  ...metaObject('Flash Sales'),
};

const pageHeader = {
  title: 'Flash Sales',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.flashSales,
      name: 'Flash Sales',
    },
    {
      name: 'All',
    },
  ],
};

export default function FlashSalesPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {/* <ExportButton data={flashSalesData} fileName="flash_sales_data" header="..." /> */}
          <Link
            href={routes.eCommerce.createFlashSale}
            className="w-full @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Create Flash Sale
            </Button>
          </Link>
        </div>
      </PageHeader>
      {/* <FlashSalesTable /> */}
      <div>Flash sales table goes here</div>
    </>
  );
}
