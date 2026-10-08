import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import { CreateFaqGroup } from '@/app/shared/content/faqs/faq-group-form';

export const metadata = {
  ...metaObject('New FAQ group'),
};

const pageHeader = {
  title: 'New FAQ group',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.faqs, name: 'FAQs' }, { name: 'Create' }],
};

export default function CreateFaqsPage() {
  return (
    <FeatureGate feature="content">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.CREATE}>
        <CreateFaqGroup />
      </RouteGuard>
    </FeatureGate>
  );
}
