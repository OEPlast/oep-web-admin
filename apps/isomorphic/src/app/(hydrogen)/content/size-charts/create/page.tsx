import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import SizeChartForm from '@/app/shared/content/size-charts/size-chart-form';

export const metadata = {
  ...metaObject('New size chart'),
};

const pageHeader = {
  title: 'New size chart',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.sizeCharts, name: 'Size charts' }, { name: 'Create' }],
};

export default function CreateSizeChartsPage() {
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.CREATE}>
        <SizeChartForm />
      </RouteGuard>
    </FeatureGate>
  );
}
