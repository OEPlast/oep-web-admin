import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import StockAlerts from '@/app/shared/support/stock-alerts';

export const metadata = {
  ...metaObject('Stock alerts'),
};

const pageHeader = {
  title: 'Stock alerts',
  breadcrumb: [{ name: 'Support' }, { href: routes.support.stockAlerts, name: 'Stock alerts' }],
};

export default function StockAlertsPage() {
  return (
    <FeatureGate feature="stockAlerts">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.SUPPORT]} action={PermissionAction.READ}>
        <StockAlerts />
      </RouteGuard>
    </FeatureGate>
  );
}
