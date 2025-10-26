import { routes } from '@/config/routes';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import CampaignsList from './campaigns-list';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';

export const metadata = {
  ...metaObject('Campaigns'),
};

const pageHeader = {
  title: 'Campaigns',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.campaign,
      name: 'Campaigns',
    },
    {
      name: 'All',
    },
  ],
};

export default function CampaignsPage() {
  return (
    <>
      <PageHeaderWithNavigation
        href={routes.eCommerce.createCampaign}
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
      />
      <CampaignsList />
    </>
  );
}
