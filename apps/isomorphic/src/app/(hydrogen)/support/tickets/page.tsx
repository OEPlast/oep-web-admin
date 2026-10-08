import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import TicketsInbox from '@/app/shared/support/tickets-inbox';

export const metadata = {
  ...metaObject('Support inbox'),
};

const pageHeader = {
  title: 'Support inbox',
  breadcrumb: [{ name: 'Support' }, { href: routes.support.tickets, name: 'Inbox' }],
};

export default function SupportInboxPage() {
  return (
    <FeatureGate feature="support">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.SUPPORT]} action={PermissionAction.READ}>
        <TicketsInbox />
      </RouteGuard>
    </FeatureGate>
  );
}
