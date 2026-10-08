import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import SizeChartsList from '@/app/shared/content/size-charts/size-charts-list';

export const metadata = {
  ...metaObject('Size charts'),
};

const pageHeader = {
  title: 'Size charts',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.sizeCharts, name: 'Size charts' }, { name: 'All' }],
};

export default function SizeChartsPage() {
  return (
    <FeatureGate feature="content">
      <PageHeaderWithNavigation
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        href={routes.content.createSizeChart}
        buttonText="New size chart"
      />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.READ}>
        <SizeChartsList />
      </RouteGuard>
    </FeatureGate>
  );
}
