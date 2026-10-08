import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import FeatureGate from '@/components/FeatureGate';
import { RouteGuard } from '@/components/RouteGuard';
import { PermissionAction, PermissionResource } from '@/hooks/queries/usePermissions';
import PickupLocations from '@/app/shared/logistics/pickup-locations/pickup-locations';

export const metadata = {
  ...metaObject('Pickup locations'),
};

const pageHeader = {
  title: 'Pickup locations',
  breadcrumb: [
    { href: routes.eCommerce.logistics.home, name: 'Logistics' },
    { href: routes.pickupLocations, name: 'Pickup locations' },
  ],
};

export default function PickupLocationsPage() {
  return (
    <FeatureGate feature="pickup">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <RouteGuard resources={[PermissionResource.PICKUP]} action={PermissionAction.READ}>
        <PickupLocations />
      </RouteGuard>
    </FeatureGate>
  );
}
