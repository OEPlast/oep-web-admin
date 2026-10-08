import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import { EditFaqGroup } from '@/app/shared/content/faqs/faq-group-form';

export const metadata = {
  ...metaObject('Edit FAQ group'),
};

const pageHeader = {
  title: 'Edit FAQ group',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.faqs, name: 'FAQs' }, { name: 'Edit' }],
};

export default async function EditFaqsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.UPDATE}>
        <EditFaqGroup id={id} />
      </RouteGuard>
    </FeatureGate>
  );
}
