import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import TicketDetail from '@/app/shared/support/ticket-detail';

export const metadata = {
  ...metaObject('Support ticket'),
};

const pageHeader = {
  title: 'Support ticket',
  breadcrumb: [{ name: 'Support' }, { href: routes.support.tickets, name: 'Inbox' }, { name: 'Ticket' }],
};

// Main-server's new-ticket emails link here (${ADMIN_URL}/support/tickets/<id>).
export default async function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <FeatureGate feature="support">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.SUPPORT]} action={PermissionAction.READ}>
        <TicketDetail id={id} />
      </RouteGuard>
    </FeatureGate>
  );
}
