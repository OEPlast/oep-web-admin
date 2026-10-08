import VyluxImport from '@/app/shared/ecommerce/product/vylux-import';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';

export const metadata = {
  ...metaObject('Import from Vylux'),
};

const pageHeader = {
  title: 'Import from Vylux',
  breadcrumb: [
    { href: routes.eCommerce.dashboard, name: 'E-Commerce' },
    { href: routes.eCommerce.products, name: 'Products' },
    { name: 'Import from Vylux' },
  ],
};

export default function ImportVyluxPage() {
  return (
    <FeatureGate feature="vylux">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.PRODUCTS]} action={PermissionAction.CREATE}>
        <VyluxImport />
      </RouteGuard>
    </FeatureGate>
  );
}
