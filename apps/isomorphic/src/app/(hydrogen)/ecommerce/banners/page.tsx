import Link from 'next/link';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import PageHeader from '@/app/shared/page-header';
// import BannersTable from '@/app/shared/ecommerce/banners/banners-table'; // To be implemented
import { PiPlusBold } from 'react-icons/pi';
// import { bannerData } from '@/data/banner-data'; // To be implemented
import { metaObject } from '@/config/site.config';
// import ExportButton from '@/app/shared/export-button'; // Optional

export const metadata = {
  ...metaObject('Banners'),
};

const pageHeader = {
  title: 'Banners',
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
      name: 'All',
    },
  ],
};

export default function BannersPage() {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          {/* <ExportButton data={bannerData} fileName="banners_data" header="..." /> */}
          <Link
            href={routes.eCommerce.createBanner}
            className="w-full @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
              Create Banner
            </Button>
          </Link>
        </div>
      </PageHeader>
      {/* <BannersTable /> */}
      <div>Banners table goes here</div>
    </>
  );
}
