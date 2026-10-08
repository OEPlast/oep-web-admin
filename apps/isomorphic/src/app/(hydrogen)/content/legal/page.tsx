import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import LegalList from '@/app/shared/content/legal/legal-list';

export const metadata = {
  ...metaObject('Legal pages'),
};

const pageHeader = {
  title: 'Legal pages',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.legal, name: 'Legal pages' }, { name: 'All' }],
};

export default function LegalPagesPage() {
  return (
    <FeatureGate feature="content">
      <PageHeaderWithNavigation
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        href={routes.content.createLegal}
        buttonText="New legal page"
      />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.READ}>
        <LegalList />
      </RouteGuard>
    </FeatureGate>
  );
}
