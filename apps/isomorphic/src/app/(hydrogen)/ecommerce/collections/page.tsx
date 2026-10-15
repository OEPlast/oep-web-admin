import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import Collections from '@/app/shared/ecommerce/collections/collections';

export const metadata = {
  ...metaObject('Collections'),
};

const pageHeader = {
  title: 'Collections',
  breadcrumb: [
    { href: routes.eCommerce.dashboard, name: 'E-Commerce' },
    { href: routes.collections, name: 'Collections' },
  ],
};

export default function CollectionsPage() {
  return (
    <FeatureGate feature="collections">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.PRODUCTS]} action={PermissionAction.READ}>
        <Collections />
      </RouteGuard>
    </FeatureGate>
  );
}
