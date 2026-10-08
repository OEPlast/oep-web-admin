import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeaderWithNavigation from '@/app/shared/page-header-w-nav';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import FaqGroupsList from '@/app/shared/content/faqs/faq-groups-list';

export const metadata = {
  ...metaObject('FAQs'),
};

const pageHeader = {
  title: 'FAQs',
  breadcrumb: [{ name: 'Storefront content' }, { href: routes.content.faqs, name: 'FAQs' }, { name: 'All' }],
};

export default function FaqsPage() {
  return (
    <FeatureGate feature="content">
      <PageHeaderWithNavigation
        title={pageHeader.title}
        breadcrumb={pageHeader.breadcrumb}
        href={routes.content.createFaqGroup}
        buttonText="New group"
      />
      <RouteGuard resources={[PermissionResource.CONTENT]} action={PermissionAction.READ}>
        <FaqGroupsList />
      </RouteGuard>
    </FeatureGate>
  );
}
