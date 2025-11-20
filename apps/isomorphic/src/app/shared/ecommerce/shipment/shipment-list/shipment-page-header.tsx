'use client';

import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { PiPlusBold, PiReceiptDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiClockDuotone, PiArrowCounterClockwiseDuotone } from 'react-icons/pi';
import { Button, Loader, Text } from 'rizzui';
import Link from 'next/link';
import { useShipmentStats } from '@/hooks/queries/useShipmentStats';
import { BiBus } from 'react-icons/bi';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const StatCard = ({ title, value, icon, variant = 'secondary', description }: { title: string; value: string | number; icon?: React.ReactNode; variant?: Variant; description?: string }) => {
  const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary-lighter/20 text-primary',
    success: 'bg-green-lighter/20 text-green-dark',
    warning: 'bg-orange-lighter/20 text-orange-dark',
    danger: 'bg-red-lighter/20 text-red-dark',
    info: 'bg-blue-lighter/20 text-blue-dark',
    secondary: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="rounded-lg border border-muted bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Text className="mb-1 text-xs font-medium text-gray-600">{title}</Text>
          <Text className="text-xl font-bold text-gray-900">{value}</Text>
          {description && <Text className="mt-1 text-[11px] text-gray-500">{description}</Text>}
        </div>
        {icon && <div className={`rounded-lg p-2 ${variantClasses[variant]}`}>{icon}</div>}
      </div>
    </div>
  );
};

export default function ShipmentPageHeader() {
  const { data: stats, isLoading, error } = useShipmentStats();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Shipments"
        breadcrumb={[
          { href: routes.eCommerce.dashboard, name: 'E-Commerce' },
          { name: 'Shipments' },
        ]}
      >
        <Link href={routes.eCommerce.shipment.createShipment} className="mt-4 w-full @lg:mt-0 @lg:w-auto">
          <Button as="span" className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Create Shipment
          </Button>
        </Link>
      </PageHeader>

      {/* Tiny stats header using Transaction Statistics method */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 @sm:grid-cols-3 @xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex h-20 items-center justify-center rounded-lg border border-muted bg-white">
              <Loader variant="spinner" size="sm" />
            </div>
          ))}
        </div>
      ) : error || !stats ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <Text className="text-red-600">Failed to load shipment statistics. Please try again.</Text>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 @xl:grid-cols-3 @4xl:grid-cols-4">
          <StatCard title="In Warehouse" value={stats['In-Warehouse'] ?? 0} icon={<PiReceiptDuotone className="h-5 w-5" />} variant="secondary" />
          <StatCard title="Shipped" value={stats.Shipped ?? 0} icon={<PiClockDuotone className="h-5 w-5" />} variant="info" />
          <StatCard title="Dispatched" value={stats.Dispatched ?? 0} icon={<PiClockDuotone className="h-5 w-5" />} variant="warning" />
          <StatCard title="In-Transit" value={stats['In-Transit'] ?? 0} icon={<BiBus className="h-5 w-5" />} variant="warning" />
          <StatCard title="Delivered" value={stats.Delivered ?? 0} icon={<PiCheckCircleDuotone className="h-5 w-5" />} variant="success" />
          <StatCard title="Returned" value={stats.Returned ?? 0} icon={<PiArrowCounterClockwiseDuotone className="h-5 w-5" />} variant="info" />
          <StatCard title="Failed" value={stats.Failed ?? 0} icon={<PiXCircleDuotone className="h-5 w-5" />} variant="danger" />
        </div>
      )}
    </div>
  );
}
