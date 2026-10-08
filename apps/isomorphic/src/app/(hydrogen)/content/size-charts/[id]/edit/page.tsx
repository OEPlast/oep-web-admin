import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import { EditSizeChart } from '@/app/shared/content/size-charts/size-chart-form';

export const metadata = {
  ...metaObject('Edit size chart'),
};

const pageHeader = {
  title: 'Edit size chart',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.sizeCharts, name: 'Size charts' }, { name: 'Edit' }],
};

export default async function EditSizeChartsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.UPDATE}>
        <EditSizeChart id={id} />
      </RouteGuard>
    </FeatureGate>
  );
}
