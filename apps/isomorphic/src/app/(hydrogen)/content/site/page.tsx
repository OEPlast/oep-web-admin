import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import SiteContentForm from '@/app/shared/content/site-content-form';

export const metadata = {
  ...metaObject('Home & site content'),
};

const pageHeader = {
  title: 'Home & site content',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.site, name: 'Home & site content' }],
};

export default function SiteContentPage() {
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.UPDATE}>
        <SiteContentForm />
      </RouteGuard>
    </FeatureGate>
  );
}
