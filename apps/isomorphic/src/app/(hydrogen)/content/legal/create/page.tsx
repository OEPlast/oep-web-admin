import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import LegalForm from '@/app/shared/content/legal/legal-form';

export const metadata = {
  ...metaObject('New legal page'),
};

const pageHeader = {
  title: 'New legal page',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.legal, name: 'Legal pages' }, { name: 'Create' }],
};

export default function CreateLegalPagesPage() {
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.CREATE}>
        <LegalForm />
      </RouteGuard>
    </FeatureGate>
  );
}
