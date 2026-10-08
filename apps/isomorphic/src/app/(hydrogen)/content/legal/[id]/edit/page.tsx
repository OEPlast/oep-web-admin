import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import { EditLegalDocument } from '@/app/shared/content/legal/legal-form';

export const metadata = {
  ...metaObject('Edit legal page'),
};

const pageHeader = {
  title: 'Edit legal page',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.legal, name: 'Legal pages' }, { name: 'Edit' }],
};

export default async function EditLegalPagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.UPDATE}>
        <EditLegalDocument id={id} />
      </RouteGuard>
    </FeatureGate>
  );
}
